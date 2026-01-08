import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ApprovalRequest {
  action: 'create' | 'approve' | 'reject' | 'list'
  post_content?: string
  mentions?: string[]
  hashtags?: string[]
  platform?: string
  approval_id?: string
  rejection_reason?: string
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      throw new Error('Invalid token')
    }

    const {
      action,
      post_content,
      mentions = [],
      hashtags = [],
      platform,
      approval_id,
      rejection_reason
    }: ApprovalRequest = await req.json()

    console.log(`[Approval Workflow] Action: ${action} for user: ${user.id}`)

    // CREATE - Request approval for a post
    if (action === 'create') {
      if (!post_content || !platform) {
        throw new Error('Missing required fields: post_content, platform')
      }

      // Get user's team admin (approval authority)
      // For now, we'll use the user's own ID as approver
      // In a real implementation, this would query team_members table
      const approver_user_id = user.id

      const { data: approval, error: createError } = await supabase
        .from('team_approvals')
        .insert({
          user_id: approver_user_id,
          post_content,
          mentions,
          hashtags,
          platform,
          requested_by_user_id: user.id,
          approval_status: 'pending'
        })
        .select()
        .single()

      if (createError) {
        throw new Error(`Failed to create approval request: ${createError.message}`)
      }

      console.log(`[Approval Workflow] Created approval request: ${approval.id}`)

      return new Response(
        JSON.stringify({
          success: true,
          approval_id: approval.id,
          message: 'Approval request created',
          approval
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // APPROVE - Approve a pending request
    if (action === 'approve') {
      if (!approval_id) {
        throw new Error('Missing approval_id')
      }

      // Verify user has permission to approve
      const { data: approval, error: fetchError } = await supabase
        .from('team_approvals')
        .select('*')
        .eq('id', approval_id)
        .single()

      if (fetchError || !approval) {
        throw new Error('Approval request not found')
      }

      if (approval.user_id !== user.id) {
        throw new Error('Not authorized to approve this request')
      }

      if (approval.approval_status !== 'pending') {
        throw new Error(`Approval already ${approval.approval_status}`)
      }

      const { data: updated, error: updateError } = await supabase
        .from('team_approvals')
        .update({
          approval_status: 'approved',
          approved_by_user_id: user.id,
          approved_at: new Date().toISOString()
        })
        .eq('id', approval_id)
        .select()
        .single()

      if (updateError) {
        throw new Error(`Failed to approve: ${updateError.message}`)
      }

      console.log(`[Approval Workflow] Approved request: ${approval_id}`)

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Approval request approved',
          approval: updated
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // REJECT - Reject a pending request
    if (action === 'reject') {
      if (!approval_id) {
        throw new Error('Missing approval_id')
      }

      const { data: approval, error: fetchError } = await supabase
        .from('team_approvals')
        .select('*')
        .eq('id', approval_id)
        .single()

      if (fetchError || !approval) {
        throw new Error('Approval request not found')
      }

      if (approval.user_id !== user.id) {
        throw new Error('Not authorized to reject this request')
      }

      if (approval.approval_status !== 'pending') {
        throw new Error(`Approval already ${approval.approval_status}`)
      }

      const { data: updated, error: updateError } = await supabase
        .from('team_approvals')
        .update({
          approval_status: 'rejected',
          approved_by_user_id: user.id,
          approved_at: new Date().toISOString(),
          rejection_reason: rejection_reason || 'Not approved'
        })
        .eq('id', approval_id)
        .select()
        .single()

      if (updateError) {
        throw new Error(`Failed to reject: ${updateError.message}`)
      }

      console.log(`[Approval Workflow] Rejected request: ${approval_id}`)

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Approval request rejected',
          approval: updated
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // LIST - Get pending approvals
    if (action === 'list') {
      const { data: approvals, error: listError } = await supabase
        .from('team_approvals')
        .select('*')
        .eq('user_id', user.id)
        .eq('approval_status', 'pending')
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })

      if (listError) {
        throw new Error(`Failed to list approvals: ${listError.message}`)
      }

      console.log(`[Approval Workflow] Listed ${approvals?.length || 0} pending approvals`)

      return new Response(
        JSON.stringify({
          success: true,
          approvals: approvals || [],
          count: approvals?.length || 0
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    throw new Error(`Invalid action: ${action}`)

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to process approval workflow'
    console.error('[Approval Workflow] Error:', error)
    return new Response(
      JSON.stringify({
        error: errorMessage,
        success: false
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
