import { NextRequest, NextResponse } from 'next/server'
import { proposalsServiceAdmin } from '@/lib/proposals-firebase-admin'
import { verifyAdminToken } from '@/lib/auth-server'

// GET - Obtener propuesta por ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('📡 API /api/proposals/[id] - Verificando autenticación...')

    const authResult = await verifyAdminToken(request)
    if (!authResult.success) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const proposal = await proposalsServiceAdmin.getProposalById(params.id)
    
    if (!proposal) {
      return NextResponse.json({ error: 'Propuesta no encontrada' }, { status: 404 })
    }
    
    return NextResponse.json({ 
      proposal: proposal,
      source: 'firebase'
    })

  } catch (error) {
    console.error('❌ Error in proposals/[id]:', error)
    return NextResponse.json({ 
      error: 'Error obteniendo propuesta',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 })
  }
}

// PATCH - Actualizar estado de propuesta
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`📡 API /api/proposals/[id] - Actualizando propuesta ${params.id}`)

    const authResult = await verifyAdminToken(request)
    if (!authResult.success) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { status, rejectionReason } = await request.json()
    
    if (!status || !['pending', 'approved', 'rejected'].includes(status)) {
      return NextResponse.json({ 
        error: 'Estado inválido. Debe ser: pending, approved, o rejected' 
      }, { status: 400 })
    }

    const reviewedBy = authResult.user?.email || 'Admin'
    
    const updatedProposal = await proposalsServiceAdmin.updateProposalStatus(
      params.id, 
      status,
      reviewedBy,
      rejectionReason
    )
    
    if (!updatedProposal) {
      return NextResponse.json({ error: 'Propuesta no encontrada' }, { status: 404 })
    }
    
    return NextResponse.json({ 
      success: true,
      proposal: updatedProposal,
      message: `Propuesta ${status === 'approved' ? 'aprobada' : status === 'rejected' ? 'rechazada' : 'actualizada'} exitosamente`
    })

  } catch (error) {
    console.error('❌ Error updating proposal:', error)
    return NextResponse.json({ 
      error: 'Error actualizando propuesta',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 })
  }
}

// DELETE - Eliminar propuesta
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`📡 API /api/proposals/[id] - Eliminando propuesta ${params.id}`)

    const authResult = await verifyAdminToken(request)
    if (!authResult.success) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const success = await proposalsServiceAdmin.deleteProposal(params.id)
    
    if (!success) {
      return NextResponse.json({ error: 'Error eliminando propuesta' }, { status: 500 })
    }
    
    return NextResponse.json({ 
      success: true,
      message: 'Propuesta eliminada exitosamente'
    })

  } catch (error) {
    console.error('❌ Error deleting proposal:', error)
    return NextResponse.json({ 
      error: 'Error eliminando propuesta',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 })
  }
}