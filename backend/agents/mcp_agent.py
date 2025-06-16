
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
        
        # Load enhanced marketing tools
        self._setup_enhanced_marketing_servers()
    
    def _setup_enhanced_marketing_servers(self):
        """Setup comprehensive marketing tools via MCP"""
        
        # CRM Platforms
        self.add_server(MCPServerConfig(
            name="hubspot",
            connection_type=MCPConnectionType.HTTP_SSE,
            url="https://api.hubspot.com/mcp"
        ))
        
        self.add_server(MCPServerConfig(
            name="salesforce",
            connection_type=MCPConnectionType.HTTP_SSE,
            url="https://api.salesforce.com/mcp"
        ))
        
        self.add_server(MCPServerConfig(
            name="pipedrive",
            connection_type=MCPConnectionType.HTTP_SSE,
            url="https://api.pipedrive.com/mcp"
        ))
        
        # Marketing Automation
        self.add_server(MCPServerConfig(
            name="marketo",
            connection_type=MCPConnectionType.HTTP_SSE,
            url="https://api.marketo.com/mcp"
        ))
        
        self.add_server(MCPServerConfig(
            name="pardot",
            connection_type=MCPConnectionType.HTTP_SSE,
            url="https://api.pardot.com/mcp"
        ))
        
        self.add_server(MCPServerConfig(
            name="activecampaign",
            connection_type=MCPConnectionType.HTTP_SSE,
            url="https://api.activecampaign.com/mcp"
        ))
        
        # Social Media Platforms
        self.add_server(MCPServerConfig(
            name="facebook_business",
            connection_type=MCPConnectionType.HTTP_SSE,
            url="https://graph.facebook.com/mcp"
        ))
        
        self.add_server(MCPServerConfig(
            name="twitter_business",
            connection_type=MCPConnectionType.HTTP_SSE,
            url="https://api.twitter.com/mcp"
        ))
        
        self.add_server(MCPServerConfig(
            name="youtube",
            connection_type=MCPConnectionType.HTTP_SSE,
            url="https://developers.google.com/youtube/mcp"
        ))
        
        # E-commerce Platforms
        self.add_server(MCPServerConfig(
            name="shopify",
            connection_type=MCPConnectionType.HTTP_SSE,
            url="https://api.shopify.com/mcp"
        ))
        
        self.add_server(MCPServerConfig(
            name="woocommerce",
            connection_type=MCPConnectionType.HTTP_SSE,
            url="https://woocommerce.com/wp-json/mcp"
        ))
        
        self.add_server(MCPServerConfig(
            name="magento",
            connection_type=MCPConnectionType.HTTP_SSE,
            url="https://api.magento.com/mcp"
        ))
        
        # Analytics Platforms
        self.add_server(MCPServerConfig(
            name="google_ads",
            connection_type=MCPConnectionType.HTTP_SSE,
            url="https://googleads.googleapis.com/mcp"
        ))
        
        self.add_server(MCPServerConfig(
            name="facebook_ads",
            connection_type=MCPConnectionType.HTTP_SSE,
            url="https://graph.facebook.com/ads/mcp"
        ))
        
        self.add_server(MCPServerConfig(
            name="google_analytics",
            connection_type=MCPConnectionType.HTTP_SSE,
            url="https://analytics.googleapis.com/mcp"
        ))
        
        # Content Management
        self.add_server(MCPServerConfig(
            name="wordpress",
            connection_type=MCPConnectionType.HTTP_SSE,
            url="https://api.wordpress.org/mcp"
        ))
        
        self.add_server(MCPServerConfig(
            name="contentful",
            connection_type=MCPConnectionType.HTTP_SSE,
            url="https://api.contentful.com/mcp"
        ))
        
        # Communication Platforms
        self.add_server(MCPServerConfig(
            name="twilio",
            connection_type=MCPConnectionType.HTTP_SSE,
            url="https://api.twilio.com/mcp"
        ))
        
        self.add_server(MCPServerConfig(
            name="sendgrid",
            connection_type=MCPConnectionType.HTTP_SSE,
            url="https://api.sendgrid.com/mcp"
        ))
        
        # SEO Tools
        self.add_server(MCPServerConfig(
            name="semrush",
            connection_type=MCPConnectionType.HTTP_SSE,
            url="https://api.semrush.com/mcp"
        ))
        
        self.add_server(MCPServerConfig(
            name="ahrefs",
            connection_type=MCPConnectionType.HTTP_SSE,
            url="https://api.ahrefs.com/mcp"
        ))
        
        # Legacy connectors for backward compatibility
        self.add_server(MCPServerConfig(
            name="social_media_hub",
            connection_type=MCPConnectionType.HTTP_SSE,
            url="https://api.socialmediamcp.com/mcp"
        ))
        
        self.add_server(MCPServerConfig(
            name="email_automation",
            connection_type=MCPConnectionType.HTTP_SSE,
            url="https://api.emailmcp.com/mcp"
        ))
        
        self.add_server(MCPServerConfig(
            name="analytics_hub",
            connection_type=MCPConnectionType.HTTP_SSE,
            url="https://api.analyticsmcp.com/mcp"
        ))
        
        self.add_server(MCPServerConfig(
            name="content_cms",
            connection_type=MCPConnectionType.STDIO,
            command="content-mcp-server",
            args=["--mode", "marketing"]
        ))
        
        self.add_server(MCPServerConfig(
            name="crm_connector",
            connection_type=MCPConnectionType.HTTP_SSE,
            url="https://api.crmmcp.com/mcp"
        ))
    
    # ... keep existing code (rest of the MCPAgent class methods remain the same)
    
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

# ... keep existing code (rest of the file remains the same)
