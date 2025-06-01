# Enhanced AI Marketing Platform with MCP Integration
# agents/mcp_agent.py

import asyncio
import json
import logging
import subprocess
import websockets
import httpx
from typing import Dict, List, Any, Optional, Union
from dataclasses import dataclass, asdict
from enum import Enum
import os
from datetime import datetime

logger = logging.getLogger(__name__)

class MCPConnectionType(Enum):
    STDIO = "stdio"
    HTTP_SSE = "http_sse"
    WEBSOCKET = "websocket"

@dataclass
class MCPServerConfig:
    name: str
    connection_type: MCPConnectionType
    command: Optional[str] = None  # For stdio
    url: Optional[str] = None      # For HTTP/WebSocket
    args: Optional[List[str]] = None
    env: Optional[Dict[str, str]] = None
    timeout: int = 30

@dataclass
class MCPTool:
    name: str
    description: str
    parameters: Dict[str, Any]
    server: str
    
@dataclass
class MCPResource:
    uri: str
    name: str
    description: str
    mime_type: Optional[str] = None

class MCPAgent:
    """Universal MCP client for AI Marketing Platform"""
    
    def __init__(self):
        self.servers: Dict[str, MCPServerConfig] = {}
        self.connections: Dict[str, Any] = {}
        self.available_tools: Dict[str, MCPTool] = {}
        self.available_resources: Dict[str, MCPResource] = {}
        self.available_prompts: Dict[str, Dict] = {}
        
        # Load default marketing tools
        self._setup_default_marketing_servers()
    
    def _setup_default_marketing_servers(self):
        """Setup common marketing tools via MCP"""
        
        # Social Media Tools
        self.add_server(MCPServerConfig(
            name="social_media_hub",
            connection_type=MCPConnectionType.HTTP_SSE,
            url="https://api.socialmediamcp.com/mcp"
        ))
        
        # Email Marketing
        self.add_server(MCPServerConfig(
            name="email_automation",
            connection_type=MCPConnectionType.HTTP_SSE,
            url="https://api.emailmcp.com/mcp"
        ))
        
        # Analytics & Reporting
        self.add_server(MCPServerConfig(
            name="analytics_hub",
            connection_type=MCPConnectionType.HTTP_SSE,
            url="https://api.analyticsmcp.com/mcp"
        ))
        
        # Content Management
        self.add_server(MCPServerConfig(
            name="content_cms",
            connection_type=MCPConnectionType.STDIO,
            command="content-mcp-server",
            args=["--mode", "marketing"]
        ))
        
        # CRM Integration
        self.add_server(MCPServerConfig(
            name="crm_connector",
            connection_type=MCPConnectionType.HTTP_SSE,
            url="https://api.crmmcp.com/mcp"
        ))
    
    def add_server(self, config: MCPServerConfig):
        """Add MCP server configuration"""
        self.servers[config.name] = config
    
    async def connect_all_servers(self):
        """Connect to all configured MCP servers"""
        for server_name, config in self.servers.items():
            try:
                await self._connect_server(server_name, config)
                logger.info(f"Connected to MCP server: {server_name}")
            except Exception as e:
                logger.error(f"Failed to connect to {server_name}: {str(e)}")
    
    async def _connect_server(self, name: str, config: MCPServerConfig):
        """Connect to individual MCP server"""
        
        if config.connection_type == MCPConnectionType.STDIO:
            # Start subprocess for stdio connection
            process = await asyncio.create_subprocess_exec(
                config.command,
                *config.args if config.args else [],
                stdin=asyncio.subprocess.PIPE,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
                env={**os.environ, **(config.env or {})}
            )
            
            self.connections[name] = {
                "type": "stdio",
                "process": process,
                "stdin": process.stdin,
                "stdout": process.stdout
            }
            
        elif config.connection_type == MCPConnectionType.HTTP_SSE:
            # HTTP + Server-Sent Events connection
            client = httpx.AsyncClient(timeout=config.timeout)
            self.connections[name] = {
                "type": "http_sse",
                "client": client,
                "url": config.url
            }
            
        elif config.connection_type == MCPConnectionType.WEBSOCKET:
            # WebSocket connection
            websocket = await websockets.connect(config.url)
            self.connections[name] = {
                "type": "websocket",
                "socket": websocket
            }
        
        # Discover capabilities after connection
        await self._discover_server_capabilities(name)
    
    async def _discover_server_capabilities(self, server_name: str):
        """Discover tools, resources, and prompts from MCP server"""
        
        # Request server capabilities
        request = {
            "jsonrpc": "2.0",
            "id": 1,
            "method": "tools/list"
        }
        
        response = await self._send_request(server_name, request)
        
        if response and "result" in response:
            tools = response["result"].get("tools", [])
            for tool in tools:
                tool_obj = MCPTool(
                    name=tool["name"],
                    description=tool["description"],
                    parameters=tool.get("inputSchema", {}),
                    server=server_name
                )
                self.available_tools[f"{server_name}.{tool['name']}"] = tool_obj
        
        # Discover resources
        request["method"] = "resources/list"
        response = await self._send_request(server_name, request)
        
        if response and "result" in response:
            resources = response["result"].get("resources", [])
            for resource in resources:
                resource_obj = MCPResource(
                    uri=resource["uri"],
                    name=resource["name"],
                    description=resource["description"],
                    mime_type=resource.get("mimeType")
                )
                self.available_resources[resource["uri"]] = resource_obj
        
        # Discover prompts
        request["method"] = "prompts/list"
        response = await self._send_request(server_name, request)
        
        if response and "result" in response:
            prompts = response["result"].get("prompts", [])
            for prompt in prompts:
                self.available_prompts[f"{server_name}.{prompt['name']}"] = prompt
    
    async def _send_request(self, server_name: str, request: Dict) -> Optional[Dict]:
        """Send JSON-RPC request to MCP server"""
        
        connection = self.connections.get(server_name)
        if not connection:
            raise ValueError(f"No connection to server: {server_name}")
        
        if connection["type"] == "stdio":
            # Send via stdin/stdout
            stdin = connection["stdin"]
            stdout = connection["stdout"]
            
            message = json.dumps(request) + "\n"
            stdin.write(message.encode())
            await stdin.drain()
            
            # Read response
            response_line = await stdout.readline()
            if response_line:
                return json.loads(response_line.decode())
        
        elif connection["type"] == "http_sse":
            # Send via HTTP
            client = connection["client"]
            url = connection["url"]
            
            response = await client.post(url, json=request)
            if response.status_code == 200:
                return response.json()
        
        elif connection["type"] == "websocket":
            # Send via WebSocket
            socket = connection["socket"]
            
            await socket.send(json.dumps(request))
            response = await socket.recv()
            return json.loads(response)
        
        return None
    
    async def invoke_tool(self, tool_name: str, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """Invoke MCP tool with parameters"""
        
        if tool_name not in self.available_tools:
            raise ValueError(f"Tool not found: {tool_name}")
        
        tool = self.available_tools[tool_name]
        server_name = tool.server
        
        request = {
            "jsonrpc": "2.0",
            "id": 2,
            "method": "tools/call",
            "params": {
                "name": tool.name,
                "arguments": parameters
            }
        }
        
        response = await self._send_request(server_name, request)
        
        if response and "result" in response:
            return response["result"]
        elif response and "error" in response:
            raise Exception(f"Tool error: {response['error']}")
        else:
            raise Exception("No response from tool")
    
    async def get_resource(self, uri: str) -> Dict[str, Any]:
        """Get resource content by URI"""
        
        # Find which server has this resource
        resource = self.available_resources.get(uri)
        if not resource:
            raise ValueError(f"Resource not found: {uri}")
        
        # Extract server name from URI or search connections
        server_name = None
        for name in self.connections.keys():
            if uri.startswith(name) or f"{name}://" in uri:
                server_name = name
                break
        
        if not server_name:
            # Try first available server
            server_name = list(self.connections.keys())[0]
        
        request = {
            "jsonrpc": "2.0",
            "id": 3,
            "method": "resources/read",
            "params": {"uri": uri}
        }
        
        response = await self._send_request(server_name, request)
        
        if response and "result" in response:
            return response["result"]
        else:
            raise Exception(f"Failed to get resource: {uri}")
    
    async def list_available_tools(self) -> List[Dict[str, Any]]:
        """List all available tools across all servers"""
        return [
            {
                "name": name,
                "description": tool.description,
                "server": tool.server,
                "parameters": tool.parameters
            }
            for name, tool in self.available_tools.items()
        ]
    
    async def execute_marketing_workflow(self, workflow: Dict[str, Any]) -> Dict[str, Any]:
        """Execute complex marketing workflow using multiple MCP tools"""
        
        results = {}
        workflow_id = workflow.get("id", f"workflow_{datetime.now().strftime('%Y%m%d_%H%M%S')}")
        
        for step in workflow.get("steps", []):
            step_name = step["name"]
            tool_name = step["tool"]
            parameters = step["parameters"]
            
            try:
                logger.info(f"Executing workflow step: {step_name}")
                result = await self.invoke_tool(tool_name, parameters)
                results[step_name] = {
                    "success": True,
                    "result": result,
                    "timestamp": datetime.now().isoformat()
                }
                
                # Pass results to next step if specified
                if "pass_to_next" in step:
                    next_step_idx = workflow["steps"].index(step) + 1
                    if next_step_idx < len(workflow["steps"]):
                        next_step = workflow["steps"][next_step_idx]
                        for key, value_path in step["pass_to_next"].items():
                            # Extract value from current result
                            extracted_value = self._extract_value(result, value_path)
                            next_step["parameters"][key] = extracted_value
                
            except Exception as e:
                logger.error(f"Workflow step failed: {step_name} - {str(e)}")
                results[step_name] = {
                    "success": False,
                    "error": str(e),
                    "timestamp": datetime.now().isoformat()
                }
                
                # Stop workflow on critical failures
                if step.get("critical", False):
                    break
        
        return {
            "workflow_id": workflow_id,
            "completed_at": datetime.now().isoformat(),
            "results": results,
            "success": all(r.get("success", False) for r in results.values())
        }
    
    def _extract_value(self, data: Dict, path: str) -> Any:
        """Extract value from nested dictionary using dot notation"""
        keys = path.split(".")
        current = data
        
        for key in keys:
            if isinstance(current, dict) and key in current:
                current = current[key]
            else:
                return None
        
        return current
    
    async def close_all_connections(self):
        """Close all MCP server connections"""
        for name, connection in self.connections.items():
            try:
                if connection["type"] == "stdio":
                    process = connection["process"]
                    process.terminate()
                    await process.wait()
                elif connection["type"] == "http_sse":
                    await connection["client"].aclose()
                elif connection["type"] == "websocket":
                    await connection["socket"].close()
                
                logger.info(f"Closed connection to: {name}")
            except Exception as e:
                logger.error(f"Error closing connection to {name}: {str(e)}")

# Enhanced Marketing Platform with MCP
# main_mcp.py

from fastapi import FastAPI, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import asyncio
import logging

# Import our MCP agent
from agents.mcp_agent import MCPAgent, MCPServerConfig, MCPConnectionType

app = FastAPI(title="MCP-Powered AI Marketing Platform", version="2.0.0")
logger = logging.getLogger(__name__)

# Global MCP agent
mcp_agent = MCPAgent()

class MarketingWorkflow(BaseModel):
    id: Optional[str] = None
    name: str
    description: str
    steps: List[Dict[str, Any]]
    schedule: Optional[Dict[str, Any]] = None

class ToolInvocation(BaseModel):
    tool_name: str
    parameters: Dict[str, Any]

@app.on_event("startup")
async def startup_event():
    """Initialize MCP connections on startup"""
    logger.info("Connecting to MCP servers...")
    await mcp_agent.connect_all_servers()
    logger.info("MCP-powered AI Marketing Platform ready!")

@app.on_event("shutdown")
async def shutdown_event():
    """Clean up MCP connections"""
    await mcp_agent.close_all_connections()

@app.get("/tools")
async def list_tools():
    """List all available marketing tools via MCP"""
    tools = await mcp_agent.list_available_tools()
    return {"tools": tools, "count": len(tools)}

@app.post("/tools/invoke")
async def invoke_tool(request: ToolInvocation):
    """Invoke any MCP tool"""
    try:
        result = await mcp_agent.invoke_tool(request.tool_name, request.parameters)
        return {"success": True, "result": result}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/workflows/execute")
async def execute_workflow(workflow: MarketingWorkflow):
    """Execute complex marketing workflow"""
    try:
        result = await mcp_agent.execute_marketing_workflow(workflow.dict())
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Example: Social Media Campaign Workflow
@app.post("/campaigns/social-media")
async def create_social_media_campaign(campaign_data: Dict[str, Any]):
    """Create and execute social media campaign using MCP tools"""
    
    workflow = {
        "id": f"social_campaign_{campaign_data.get('name', 'unnamed')}",
        "name": "Social Media Campaign",
        "steps": [
            {
                "name": "generate_content",
                "tool": "content_cms.generate_post",
                "parameters": {
                    "topic": campaign_data["topic"],
                    "platform": "multi",
                    "tone": campaign_data.get("tone", "professional"),
                    "target_audience": campaign_data.get("audience", "general")
                },
                "pass_to_next": {
                    "content": "content",
                    "hashtags": "hashtags"
                }
            },
            {
                "name": "optimize_for_platforms",
                "tool": "social_media_hub.optimize_content",
                "parameters": {
                    "platforms": campaign_data.get("platforms", ["linkedin", "twitter"]),
                    "content": "",  # Will be filled from previous step
                    "hashtags": ""  # Will be filled from previous step
                },
                "pass_to_next": {
                    "optimized_posts": "posts"
                }
            },
            {
                "name": "schedule_posts",
                "tool": "social_media_hub.schedule_posts",
                "parameters": {
                    "posts": "",  # Will be filled from previous step
                    "schedule": campaign_data.get("schedule", "optimal")
                }
            },
            {
                "name": "setup_analytics",
                "tool": "analytics_hub.track_campaign",
                "parameters": {
                    "campaign_id": "",
                    "platforms": campaign_data.get("platforms", ["linkedin", "twitter"]),
                    "metrics": ["engagement", "reach", "clicks"]
                }
            }
        ]
    }
    
    result = await mcp_agent.execute_marketing_workflow(workflow)
    return result

# Example: Email Marketing Workflow
@app.post("/campaigns/email")
async def create_email_campaign(email_data: Dict[str, Any]):
    """Create email marketing campaign using MCP tools"""
    
    workflow = {
        "id": f"email_campaign_{email_data.get('name', 'unnamed')}",
        "name": "Email Marketing Campaign",
        "steps": [
            {
                "name": "segment_audience",
                "tool": "crm_connector.segment_contacts",
                "parameters": {
                    "criteria": email_data.get("targeting", {}),
                    "list_name": email_data.get("list_name", "default")
                },
                "pass_to_next": {
                    "audience_segments": "segments"
                }
            },
            {
                "name": "generate_email_content",
                "tool": "content_cms.generate_email",
                "parameters": {
                    "subject": email_data["subject"],
                    "purpose": email_data.get("purpose", "promotional"),
                    "personalization": True,
                    "segments": ""  # Will be filled from previous step
                },
                "pass_to_next": {
                    "email_variants": "variants"
                }
            },
            {
                "name": "setup_automation",
                "tool": "email_automation.create_sequence",
                "parameters": {
                    "variants": "",  # Will be filled from previous step
                    "schedule": email_data.get("schedule", {}),
                    "triggers": email_data.get("triggers", [])
                }
            },
            {
                "name": "setup_tracking",
                "tool": "analytics_hub.track_email_campaign",
                "parameters": {
                    "campaign_id": "",
                    "metrics": ["open_rate", "click_rate", "conversion_rate"]
                }
            }
        ]
    }
    
    result = await mcp_agent.execute_marketing_workflow(workflow)
    return result

@app.get("/analytics/dashboard")
async def get_analytics_dashboard():
    """Get comprehensive marketing analytics using MCP tools"""
    
    try:
        # Get data from multiple analytics tools
        social_metrics = await mcp_agent.invoke_tool(
            "analytics_hub.get_social_metrics",
            {"timeframe": "30d", "platforms": "all"}
        )
        
        email_metrics = await mcp_agent.invoke_tool(
            "analytics_hub.get_email_metrics", 
            {"timeframe": "30d"}
        )
        
        content_performance = await mcp_agent.invoke_tool(
            "content_cms.get_performance",
            {"timeframe": "30d"}
        )
        
        return {
            "social_media": social_metrics,
            "email_marketing": email_metrics,
            "content_performance": content_performance,
            "generated_at": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
