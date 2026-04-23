import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('❌ SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env')
  console.error('   Copy .env.example to .env and populate with your Supabase credentials.')
  process.exit(1)
}

const supabase = createClient(
  supabaseUrl,
  supabaseServiceRoleKey
)

function daysAgo(n) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString()
}

async function seed() {
  console.log('Seeding SmartSeason...')

  const { data: adminAuth, error: adminError } = await supabase.auth.admin.createUser({
    email: 'admin@smartseason.com',
    password: 'admin123',
    email_confirm: true,
    user_metadata: { name: 'Admin User', role: 'admin' }
  })
  if (adminError) throw adminError
  console.log('Created admin:', adminAuth.user.email)

  const { data: agentAuth, error: agentError } = await supabase.auth.admin.createUser({
    email: 'agent@smartseason.com',
    password: 'agent123',
    email_confirm: true,
    user_metadata: { name: 'Field Agent', role: 'agent' }
  })
  if (agentError) throw agentError
  console.log('Created agent:', agentAuth.user.email)

  const adminId = adminAuth.user.id
  const agentId = agentAuth.user.id

  await new Promise(resolve => setTimeout(resolve, 1500))

  const fields = [
    {
      name: 'North Block A',
      crop_type: 'Maize',
      planting_date: '2025-01-15',
      stage: 'growing',
      assigned_agent_id: agentId,
      created_by: adminId,
      last_updated_at: daysAgo(2),
    },
    {
      name: 'South Paddock',
      crop_type: 'Wheat',
      planting_date: '2024-10-01',
      stage: 'planted',
      assigned_agent_id: agentId,
      created_by: adminId,
      last_updated_at: daysAgo(95),
    },
    {
      name: 'East Ridge',
      crop_type: 'Sorghum',
      planting_date: '2025-02-20',
      stage: 'ready',
      assigned_agent_id: agentId,
      created_by: adminId,
      last_updated_at: daysAgo(1),
    },
    {
      name: 'West Field',
      crop_type: 'Beans',
      planting_date: '2024-09-10',
      stage: 'harvested',
      assigned_agent_id: agentId,
      created_by: adminId,
      last_updated_at: daysAgo(30),
    },
    {
      name: 'Central Plot',
      crop_type: 'Rice',
      planting_date: '2025-03-01',
      stage: 'growing',
      assigned_agent_id: null,
      created_by: adminId,
      last_updated_at: daysAgo(10),
    },
    {
      name: 'Hill Section',
      crop_type: 'Barley',
      planting_date: '2025-01-05',
      stage: 'growing',
      assigned_agent_id: agentId,
      created_by: adminId,
      last_updated_at: daysAgo(3),
    },
  ]

  const { data: createdFields, error } = await supabase
    .from('fields')
    .insert(fields)
    .select()

  if (error) {
    console.error('Error creating fields:', error)
    process.exit(1)
  }
  console.log(`Created ${createdFields.length} fields`)

  const updates = createdFields.slice(0, 4).map((field, index) => ({
    field_id: field.id,
    agent_id: agentId,
    new_stage: field.stage !== 'planted' ? field.stage : null,
    note: index % 2 === 0 ? 'Crops looking healthy, soil moisture good.' : null,
  })).filter(update => update.new_stage || update.note)

  const { error: updatesError } = await supabase.from('field_updates').insert(updates)
  if (updatesError) {
    console.error('Error creating updates:', updatesError)
    process.exit(1)
  }
  console.log('Created field updates')

  console.log('\nSeed complete.')
  console.log('  Admin:  admin@smartseason.com / admin123')
  console.log('  Agent:  agent@smartseason.com / agent123')
  process.exit(0)
}

seed().catch(err => {
  console.error(err)
  process.exit(1)
})
