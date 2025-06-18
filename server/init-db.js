const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Inicializando banco de dados...');

  // Criar usuário admin padrão
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@dronecore.com' },
    update: {},
    create: {
      name: 'Administrador',
      email: 'admin@dronecore.com',
      password: hashedPassword,
      role: 'ADMIN',
      active: true
    }
  });

  console.log('Usuário admin criado:', adminUser.email);

  // Criar alguns clientes de exemplo
  const clients = await Promise.all([
    prisma.client.upsert({
      where: { email: 'cliente1@email.com' },
      update: {},
      create: {
        name: 'João Silva',
        email: 'cliente1@email.com',
        phone: '(11) 99999-9999',
        address: 'Rua das Flores, 123 - São Paulo, SP',
        status: 'active'
      }
    }),
    prisma.client.upsert({
      where: { email: 'cliente2@email.com' },
      update: {},
      create: {
        name: 'Maria Santos',
        email: 'cliente2@email.com',
        phone: '(11) 88888-8888',
        address: 'Av. Paulista, 456 - São Paulo, SP',
        status: 'active'
      }
    })
  ]);

  console.log('Clientes de exemplo criados:', clients.length);

  // Criar drones de exemplo
  const drones = await Promise.all([
    prisma.drone.upsert({
      where: { id: 'drone-1' },
      update: {},
      create: {
        id: 'drone-1',
        model: 'DJI Phantom 4 Pro',
        status: 'available'
      }
    }),
    prisma.drone.upsert({
      where: { id: 'drone-2' },
      update: {},
      create: {
        id: 'drone-2',
        model: 'DJI Mavic 2 Pro',
        status: 'available'
      }
    })
  ]);

  console.log('Drones de exemplo criados:', drones.length);

  // Criar carros de exemplo
  const cars = await Promise.all([
    prisma.car.upsert({
      where: { plate: 'ABC-1234' },
      update: {},
      create: {
        model: 'Toyota Hilux',
        plate: 'ABC-1234',
        year: 2020,
        status: 'available'
      }
    }),
    prisma.car.upsert({
      where: { plate: 'XYZ-5678' },
      update: {},
      create: {
        model: 'Ford Ranger',
        plate: 'XYZ-5678',
        year: 2021,
        status: 'available'
      }
    })
  ]);

  console.log('Carros de exemplo criados:', cars.length);

  // Criar algumas tarefas de exemplo
  const tasks = await Promise.all([
    prisma.task.create({
      data: {
        title: 'Mapeamento de Fazenda - Fazenda São João',
        description: 'Mapeamento completo da fazenda para análise de produtividade',
        status: 'PENDING',
        priority: 'HIGH',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 dias
        location: 'Fazenda São João - Ribeirão Preto, SP',
        hectares: 150.5,
        serviceValue: 2500.00,
        clientId: clients[0].id,
        assigneeId: adminUser.id,
        droneId: drones[0].id,
        carId: cars[0].id
      }
    }),
    prisma.task.create({
      data: {
        title: 'Inspeção de Plantação - Sítio Boa Vista',
        description: 'Inspeção de pragas e análise de saúde das plantas',
        status: 'IN_PROGRESS',
        priority: 'MEDIUM',
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 dias
        location: 'Sítio Boa Vista - Campinas, SP',
        hectares: 75.2,
        serviceValue: 1800.00,
        clientId: clients[1].id,
        assigneeId: adminUser.id,
        droneId: drones[1].id,
        carId: cars[1].id
      }
    })
  ]);

  console.log('Tarefas de exemplo criadas:', tasks.length);

  // Criar algumas entradas bancárias de exemplo
  const bankEntries = await Promise.all([
    prisma.bankEntry.create({
      data: {
        description: 'Pagamento - Mapeamento Fazenda São João',
        amount: 2500.00,
        type: 'income',
        category: 'Serviços de Drone',
        date: new Date()
      }
    }),
    prisma.bankEntry.create({
      data: {
        description: 'Combustível para veículos',
        amount: 150.00,
        type: 'expense',
        category: 'Combustível',
        date: new Date()
      }
    })
  ]);

  console.log('Entradas bancárias de exemplo criadas:', bankEntries.length);

  console.log('Banco de dados inicializado com sucesso!');
  console.log('Credenciais de acesso:');
  console.log('Email: admin@dronecore.com');
  console.log('Senha: admin123');
}

main()
  .catch((e) => {
    console.error('Erro ao inicializar banco de dados:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 