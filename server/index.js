const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();

// Initialize Prisma with error handling
let prisma = null;
try {
  const { PrismaClient } = require('@prisma/client');
  prisma = new PrismaClient();
  console.log('✅ Prisma client initialized successfully');
} catch (error) {
  console.error('❌ Failed to initialize Prisma client:', error.message);
  console.log('⚠️ Server will run without database functionality');
}

// Log environment variables
console.log('🚀 Starting DroneCore server...');
console.log('- NODE_ENV:', process.env.NODE_ENV);
console.log('- PORT:', process.env.PORT);
console.log('- DATABASE_URL exists:', !!process.env.DATABASE_URL);
console.log('- JWT_SECRET exists:', !!process.env.JWT_SECRET);

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Test database connection
async function testDatabaseConnection() {
  if (!prisma) {
    return false;
  }
  try {
    await prisma.$connect();
    console.log('✅ Database connection successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
}

// Middleware de autenticação
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token de acesso necessário' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) {
      console.error('JWT verification error:', err.message);
      return res.status(403).json({ error: 'Token inválido' });
    }
    req.user = user;
    next();
  });
};

// Middleware para verificar se é admin
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Acesso negado. Apenas administradores.' });
  }
  next();
};

// Rota de saúde da API (simples, sem dependências)
app.get('/api/health', (req, res) => {
  console.log('🏥 Health check requested');
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    database: prisma ? 'available' : 'unavailable'
  });
});

// Endpoint simples que retorna apenas um texto
app.get('/api/teste', (req, res) => {
  console.log('🧪 Teste endpoint requested');
  res.status(200).send('Olá! Este é um endpoint de teste do DroneCore API! 🚁');
});

// Rota de teste simples
app.get('/', (req, res) => {
  console.log('🏠 Root endpoint requested');
  res.status(200).json({ 
    message: 'DroneCore API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    database: prisma ? 'available' : 'unavailable'
  });
});

// Rota para verificar status do banco
app.get('/api/db-status', async (req, res) => {
  try {
    if (!prisma) {
      return res.json({ 
        database: 'unavailable',
        error: 'Prisma client not initialized',
        timestamp: new Date().toISOString()
      });
    }
    
    const dbConnected = await testDatabaseConnection();
    res.json({ 
      database: dbConnected ? 'connected' : 'disconnected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.json({ 
      database: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Rotas de Autenticação
app.post('/api/auth/login', async (req, res) => {
  if (!prisma) {
    return res.status(503).json({ error: 'Database unavailable' });
  }
  
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user || !user.active) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rotas de Usuários
app.get('/api/users', authenticateToken, requireAdmin, async (req, res) => {
  if (!prisma) {
    return res.status(503).json({ error: 'Database unavailable' });
  }
  
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        active: true,
        createdAt: true,
        updatedAt: true
      }
    });
    res.json(users);
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.post('/api/users', authenticateToken, requireAdmin, async (req, res) => {
  if (!prisma) {
    return res.status(503).json({ error: 'Database unavailable' });
  }
  
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Email já cadastrado' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || 'EMPLOYEE'
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        active: true,
        createdAt: true,
        updatedAt: true
      }
    });

    res.status(201).json(user);
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rotas de Clientes
app.get('/api/clients', authenticateToken, requireAdmin, async (req, res) => {
  if (!prisma) {
    return res.status(503).json({ error: 'Database unavailable' });
  }
  
  try {
    const clients = await prisma.client.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(clients);
  } catch (error) {
    console.error('Erro ao buscar clientes:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.post('/api/clients', authenticateToken, requireAdmin, async (req, res) => {
  if (!prisma) {
    return res.status(503).json({ error: 'Database unavailable' });
  }
  
  try {
    const { name, email, phone, address } = req.body;

    const client = await prisma.client.create({
      data: {
        name,
        email,
        phone,
        address,
        status: 'active'
      }
    });

    res.status(201).json(client);
  } catch (error) {
    console.error('Erro ao criar cliente:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.put('/api/clients/:id', authenticateToken, requireAdmin, async (req, res) => {
  if (!prisma) {
    return res.status(503).json({ error: 'Database unavailable' });
  }
  
  try {
    const { id } = req.params;
    const { name, email, phone, address, status } = req.body;

    const client = await prisma.client.update({
      where: { id },
      data: { name, email, phone, address, status }
    });

    res.json(client);
  } catch (error) {
    console.error('Erro ao atualizar cliente:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rotas de Tarefas
app.get('/api/tasks', authenticateToken, async (req, res) => {
  if (!prisma) {
    return res.status(503).json({ error: 'Database unavailable' });
  }
  
  try {
    const tasks = await prisma.task.findMany({
      include: {
        client: true,
        assignee: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        drone: true,
        car: true,
        progressEntries: {
          include: {
            photos: true
          }
        },
        images: true
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(tasks);
  } catch (error) {
    console.error('Erro ao buscar tarefas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.post('/api/tasks', authenticateToken, async (req, res) => {
  if (!prisma) {
    return res.status(503).json({ error: 'Database unavailable' });
  }
  
  try {
    const {
      title,
      description,
      priority,
      dueDate,
      location,
      hectares,
      googleMapsLink,
      kmlFile,
      serviceValue,
      clientId,
      assigneeId,
      droneId,
      carId
    } = req.body;

    const task = await prisma.task.create({
      data: {
        title,
        description,
        priority: priority || 'MEDIUM',
        dueDate: dueDate ? new Date(dueDate) : null,
        location,
        hectares: hectares ? parseFloat(hectares) : null,
        googleMapsLink,
        kmlFile,
        serviceValue: serviceValue ? parseFloat(serviceValue) : null,
        clientId,
        assigneeId,
        droneId,
        carId,
        status: 'PENDING'
      },
      include: {
        client: true,
        assignee: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        drone: true,
        car: true
      }
    });

    res.status(201).json(task);
  } catch (error) {
    console.error('Erro ao criar tarefa:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.put('/api/tasks/:id', authenticateToken, async (req, res) => {
  if (!prisma) {
    return res.status(503).json({ error: 'Database unavailable' });
  }
  
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (updateData.dueDate) {
      updateData.dueDate = new Date(updateData.dueDate);
    }
    if (updateData.hectares) {
      updateData.hectares = parseFloat(updateData.hectares);
    }
    if (updateData.serviceValue) {
      updateData.serviceValue = parseFloat(updateData.serviceValue);
    }

    const task = await prisma.task.update({
      where: { id },
      data: updateData,
      include: {
        client: true,
        assignee: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        drone: true,
        car: true,
        progressEntries: {
          include: {
            photos: true
          }
        },
        images: true
      }
    });

    res.json(task);
  } catch (error) {
    console.error('Erro ao atualizar tarefa:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rotas de Drones
app.get('/api/drones', authenticateToken, requireAdmin, async (req, res) => {
  if (!prisma) {
    return res.status(503).json({ error: 'Database unavailable' });
  }
  
  try {
    const drones = await prisma.drone.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(drones);
  } catch (error) {
    console.error('Erro ao buscar drones:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.post('/api/drones', authenticateToken, requireAdmin, async (req, res) => {
  if (!prisma) {
    return res.status(503).json({ error: 'Database unavailable' });
  }
  
  try {
    const { model, status } = req.body;

    const drone = await prisma.drone.create({
      data: {
        model,
        status: status || 'available'
      }
    });

    res.status(201).json(drone);
  } catch (error) {
    console.error('Erro ao criar drone:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rotas de Carros
app.get('/api/cars', authenticateToken, requireAdmin, async (req, res) => {
  if (!prisma) {
    return res.status(503).json({ error: 'Database unavailable' });
  }
  
  try {
    const cars = await prisma.car.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(cars);
  } catch (error) {
    console.error('Erro ao buscar carros:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.post('/api/cars', authenticateToken, requireAdmin, async (req, res) => {
  if (!prisma) {
    return res.status(503).json({ error: 'Database unavailable' });
  }
  
  try {
    const { model, plate, year, status } = req.body;

    const car = await prisma.car.create({
      data: {
        model,
        plate,
        year: parseInt(year),
        status: status || 'available'
      }
    });

    res.status(201).json(car);
  } catch (error) {
    console.error('Erro ao criar carro:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rotas de Entradas Bancárias
app.get('/api/bank-entries', authenticateToken, requireAdmin, async (req, res) => {
  if (!prisma) {
    return res.status(503).json({ error: 'Database unavailable' });
  }
  
  try {
    const entries = await prisma.bankEntry.findMany({
      orderBy: { date: 'desc' }
    });
    res.json(entries);
  } catch (error) {
    console.error('Erro ao buscar entradas bancárias:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.post('/api/bank-entries', authenticateToken, requireAdmin, async (req, res) => {
  if (!prisma) {
    return res.status(503).json({ error: 'Database unavailable' });
  }
  
  try {
    const { description, amount, type, category, date } = req.body;

    const entry = await prisma.bankEntry.create({
      data: {
        description,
        amount: parseFloat(amount),
        type,
        category,
        date: date ? new Date(date) : new Date()
      }
    });

    res.status(201).json(entry);
  } catch (error) {
    console.error('Erro ao criar entrada bancária:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rotas de Dívidas de Clientes
app.get('/api/client-debts', authenticateToken, requireAdmin, async (req, res) => {
  if (!prisma) {
    return res.status(503).json({ error: 'Database unavailable' });
  }
  
  try {
    const debts = await prisma.clientDebt.findMany({
      orderBy: { date: 'desc' }
    });
    res.json(debts);
  } catch (error) {
    console.error('Erro ao buscar dívidas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.post('/api/client-debts', authenticateToken, requireAdmin, async (req, res) => {
  if (!prisma) {
    return res.status(503).json({ error: 'Database unavailable' });
  }
  
  try {
    const { clientName, serviceDescription, totalAmount, date, taskId } = req.body;

    const debt = await prisma.clientDebt.create({
      data: {
        clientName,
        serviceDescription,
        totalAmount: parseFloat(totalAmount),
        remainingAmount: parseFloat(totalAmount),
        date: new Date(date),
        taskId
      }
    });

    res.status(201).json(debt);
  } catch (error) {
    console.error('Erro ao criar dívida:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rotas de Pagamentos de Clientes
app.get('/api/client-payments', authenticateToken, requireAdmin, async (req, res) => {
  if (!prisma) {
    return res.status(503).json({ error: 'Database unavailable' });
  }
  
  try {
    const payments = await prisma.clientPayment.findMany({
      orderBy: { date: 'desc' }
    });
    res.json(payments);
  } catch (error) {
    console.error('Erro ao buscar pagamentos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.post('/api/client-payments', authenticateToken, requireAdmin, async (req, res) => {
  if (!prisma) {
    return res.status(503).json({ error: 'Database unavailable' });
  }
  
  try {
    const { clientName, amount, debtId } = req.body;

    const payment = await prisma.clientPayment.create({
      data: {
        clientName,
        amount: parseFloat(amount),
        debtId,
        date: new Date()
      }
    });

    // Atualizar a dívida
    const debt = await prisma.clientDebt.findUnique({
      where: { id: debtId }
    });

    if (debt) {
      const newPaidAmount = debt.paidAmount + parseFloat(amount);
      const newRemainingAmount = debt.totalAmount - newPaidAmount;

      await prisma.clientDebt.update({
        where: { id: debtId },
        data: {
          paidAmount: newPaidAmount,
          remainingAmount: newRemainingAmount
        }
      });
    }

    res.status(201).json(payment);
  } catch (error) {
    console.error('Erro ao criar pagamento:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rotas de Taxas de Funcionários
app.get('/api/employee-rates', authenticateToken, requireAdmin, async (req, res) => {
  if (!prisma) {
    return res.status(503).json({ error: 'Database unavailable' });
  }
  
  try {
    const rates = await prisma.employeeRate.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(rates);
  } catch (error) {
    console.error('Erro ao buscar taxas de funcionários:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.post('/api/employee-rates', authenticateToken, requireAdmin, async (req, res) => {
  if (!prisma) {
    return res.status(503).json({ error: 'Database unavailable' });
  }
  
  try {
    const { userId, rate, startDate, endDate } = req.body;

    const employeeRate = await prisma.employeeRate.create({
      data: {
        userId,
        rate: parseFloat(rate),
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    res.status(201).json(employeeRate);
  } catch (error) {
    console.error('Erro ao criar taxa de funcionário:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.put('/api/employee-rates/:id', authenticateToken, requireAdmin, async (req, res) => {
  if (!prisma) {
    return res.status(503).json({ error: 'Database unavailable' });
  }
  
  try {
    const { id } = req.params;
    const { rate, startDate, endDate } = req.body;

    const employeeRate = await prisma.employeeRate.update({
      where: { id },
      data: {
        rate: parseFloat(rate),
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    res.json(employeeRate);
  } catch (error) {
    console.error('Erro ao atualizar taxa de funcionário:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.delete('/api/employee-rates/:id', authenticateToken, requireAdmin, async (req, res) => {
  if (!prisma) {
    return res.status(503).json({ error: 'Database unavailable' });
  }
  
  try {
    const { id } = req.params;

    await prisma.employeeRate.delete({
      where: { id }
    });

    res.json({ message: 'Taxa de funcionário removida com sucesso' });
  } catch (error) {
    console.error('Erro ao remover taxa de funcionário:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rotas de Histórico de Clientes
app.get('/api/client-history', authenticateToken, async (req, res) => {
  if (!prisma) {
    return res.status(503).json({ error: 'Database unavailable' });
  }
  
  try {
    const history = await prisma.clientHistory.findMany({
      include: {
        client: true,
        task: true
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(history);
  } catch (error) {
    console.error('Erro ao buscar histórico de clientes:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.post('/api/client-history', authenticateToken, async (req, res) => {
  if (!prisma) {
    return res.status(503).json({ error: 'Database unavailable' });
  }
  
  try {
    const { clientId, taskId, action, description } = req.body;

    const historyEntry = await prisma.clientHistory.create({
      data: {
        clientId,
        taskId,
        action,
        description,
        date: new Date()
      },
      include: {
        client: true,
        task: true
      }
    });

    res.status(201).json(historyEntry);
  } catch (error) {
    console.error('Erro ao criar entrada de histórico:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rotas de Imagens
app.post('/api/images', authenticateToken, async (req, res) => {
  if (!prisma) {
    return res.status(503).json({ error: 'Database unavailable' });
  }
  
  try {
    const { filename, dataUrl, taskId, progressEntryId } = req.body;

    const image = await prisma.image.create({
      data: {
        filename,
        dataUrl,
        taskId,
        progressEntryId
      }
    });

    res.status(201).json(image);
  } catch (error) {
    console.error('Erro ao salvar imagem:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rotas de Progresso
app.post('/api/progress-entries', authenticateToken, async (req, res) => {
  if (!prisma) {
    return res.status(503).json({ error: 'Database unavailable' });
  }
  
  try {
    const { date, description, taskId, photos } = req.body;

    const progressEntry = await prisma.progressEntry.create({
      data: {
        date: new Date(date),
        description,
        taskId,
        photos: {
          create: photos.map((photo) => ({
            filename: photo.filename,
            dataUrl: photo.dataUrl
          }))
        }
      },
      include: {
        photos: true
      }
    });

    res.status(201).json(progressEntry);
  } catch (error) {
    console.error('Erro ao criar entrada de progresso:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota de estatísticas do dashboard
app.get('/api/dashboard/stats', authenticateToken, async (req, res) => {
  if (!prisma) {
    return res.status(503).json({ error: 'Database unavailable' });
  }
  
  try {
    const [
      totalTasks,
      completedTasks,
      pendingTasks,
      inProgressTasks,
      totalClients,
      activeClients,
      totalUsers,
      activeUsers,
      totalCars,
      availableCars,
      totalDrones,
      availableDrones
    ] = await Promise.all([
      prisma.task.count(),
      prisma.task.count({ where: { status: 'COMPLETED' } }),
      prisma.task.count({ where: { status: 'PENDING' } }),
      prisma.task.count({ where: { status: 'IN_PROGRESS' } }),
      prisma.client.count(),
      prisma.client.count({ where: { status: 'active' } }),
      prisma.user.count(),
      prisma.user.count({ where: { active: true } }),
      prisma.car.count(),
      prisma.car.count({ where: { status: 'available' } }),
      prisma.drone.count(),
      prisma.drone.count({ where: { status: 'available' } })
    ]);

    res.json({
      totalTasks,
      completedTasks,
      pendingTasks,
      inProgressTasks,
      totalClients,
      activeClients,
      totalUsers,
      activeUsers,
      totalCars,
      availableCars,
      totalDrones,
      availableDrones
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server is running on http://0.0.0.0:${PORT}`);
  console.log('🚀 Performing post-start database connection test...');

  testDatabaseConnection().then(connected => {
    if (connected) {
      console.log('✅ Database connection confirmed.');
    } else {
      console.error('❌ Database connection failed post-start. The server is running but queries will likely fail.');
    }
  });
});