
import jsPDF from 'jspdf';

interface Employee {
  id: string;
  name: string;
  email: string;
}

interface Task {
  id: string;
  title: string;
  description: string;
  assignee: string;
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
  location: string;
  hectares: number;
  client: string;
  completedAt?: string;
  progressEntries?: Array<{
    date: string;
    hectares: number;
    photos: File[];
    notes: string;
    assignee: string;
    drone?: string;
    car?: string;
  }>;
}

interface EmployeeWorkData {
  employeeName: string;
  totalHectares: number;
  earnings: number;
  taskDetails: Array<{
    taskTitle: string;
    client: string;
    hectares: number;
    date: string;
  }>;
}

export const generateEmployeePaymentReport = async (employee: Employee, tasks: Task[], ratePerHectare: number) => {
  const pdf = new jsPDF();
  
  // Header with blue background
  pdf.setFillColor(74, 85, 162);
  pdf.rect(0, 0, 210, 50, 'F');
  
  // Company logo area
  pdf.setFillColor(255, 255, 255);
  pdf.rect(15, 10, 30, 30, 'F');
  
  // Add logo
  try {
    const logoImg = await loadImageFromUrl('/lovable-uploads/c02fcc86-f1bb-4bb6-b6b2-63f5680e34db.png');
    pdf.addImage(logoImg, 'PNG', 17, 12, 26, 26);
  } catch (error) {
    console.log('Logo não encontrado, continuando sem logo');
  }
  
  // Title
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(20);
  pdf.text('RELATÓRIO DE PAGAMENTO INDIVIDUAL', 55, 25);
  
  pdf.setFontSize(12);
  pdf.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, 55, 35);
  
  // Contact info
  pdf.setFontSize(11);
  pdf.setFont(undefined, 'bold');
  pdf.text('CONTATO:', 130, 17);
  pdf.setFont(undefined, 'normal');
  pdf.setFontSize(10);
  pdf.text('Telefone: (21) 99744-7883', 130, 22);
  pdf.text('Site: www.tpdrones.com.br', 130, 27);
  pdf.text('Email: contato@tpdrones.com.br', 130, 32);
  
  // Employee info
  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(16);
  pdf.text(employee.name.toUpperCase(), 20, 70);
  pdf.setFontSize(12);
  pdf.text(employee.email, 20, 80);
  
  // Calculate employee work data
  const employeeWorkData = calculateEmployeeWorkData([employee], tasks, { [employee.id]: ratePerHectare })[0];
  
  // Table header
  pdf.setFillColor(74, 85, 162);
  pdf.rect(20, 90, 170, 10, 'F');
  
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(10);
  pdf.text('SERVIÇO', 25, 97);
  pdf.text('CLIENTE', 80, 97);
  pdf.text('HECTARES', 130, 97);
  pdf.text('VALOR', 160, 97);
  
  // Tasks data
  let yPosition = 110;
  let totalAmount = 0;
  
  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(9);
  
  employeeWorkData.taskDetails.forEach((taskDetail, index) => {
    const taskAmount = taskDetail.hectares * ratePerHectare;
    totalAmount += taskAmount;
    
    // Alternate row colors
    if (index % 2 === 0) {
      pdf.setFillColor(245, 245, 245);
      pdf.rect(20, yPosition - 5, 170, 8, 'F');
    }
    
    pdf.text(taskDetail.taskTitle.substring(0, 25), 25, yPosition);
    pdf.text(taskDetail.client.substring(0, 20), 80, yPosition);
    pdf.text(`${taskDetail.hectares} ha`, 130, yPosition);
    pdf.text(`R$ ${taskAmount.toFixed(2)}`, 160, yPosition);
    
    yPosition += 10;
  });
  
  // Total section
  pdf.setFillColor(74, 85, 162);
  pdf.rect(130, yPosition + 10, 60, 15, 'F');
  
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(14);
  pdf.text(`TOTAL: R$ ${employeeWorkData.earnings.toFixed(2)}`, 135, yPosition + 20);
  
  // Additional info
  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(8);
  pdf.text(`Taxa por hectare: R$ ${ratePerHectare.toFixed(2)}`, 20, yPosition + 35);
  pdf.text(`Total de hectares: ${employeeWorkData.totalHectares.toFixed(1)}`, 20, yPosition + 45);
  
  // Footer
  pdf.setFontSize(8);
  pdf.text('TpDrones - Sistema de Gestão de Drones', 20, 280);
  pdf.text(`PIX: 517479060001055`, 120, 280);
  
  const filename = `pagamento_${employee.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
  pdf.save(filename);
};

export const generateAggregatedPaymentReport = async (employees: Employee[], tasks: Task[], employeeRates: { [key: string]: number }) => {
  const pdf = new jsPDF();
  
  // Header
  pdf.setFillColor(74, 85, 162);
  pdf.rect(0, 0, 210, 50, 'F');
  
  // Logo area
  pdf.setFillColor(255, 255, 255);
  pdf.rect(15, 10, 30, 30, 'F');
  
  try {
    const logoImg = await loadImageFromUrl('/lovable-uploads/c02fcc86-f1bb-4bb6-b6b2-63f5680e34db.png');
    pdf.addImage(logoImg, 'PNG', 17, 12, 26, 26);
  } catch (error) {
    console.log('Logo não encontrado');
  }
  
  // Title
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(20);
  pdf.text('RELATÓRIO AGREGADO DE PAGAMENTOS', 55, 25);
  
  pdf.setFontSize(12);
  pdf.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, 55, 35);
  
  // Contact info
  pdf.setFontSize(11);
  pdf.setFont(undefined, 'bold');
  pdf.text('CONTATO:', 130, 17);
  pdf.setFont(undefined, 'normal');
  pdf.setFontSize(10);
  pdf.text('Tel: (21) 99744-7883', 130, 22);
  pdf.text('www.tpdrones.com.br', 130, 27);
  pdf.text('contato@tpdrones.com.br', 130, 32);
  
  // Calculate all employee work data
  const allEmployeeData = calculateEmployeeWorkData(employees, tasks, employeeRates);
  
  // Summary section
  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(16);
  pdf.text('RESUMO GERAL', 20, 70);
  
  const totalHectares = allEmployeeData.reduce((sum, emp) => sum + emp.totalHectares, 0);
  const totalEarnings = allEmployeeData.reduce((sum, emp) => sum + emp.earnings, 0);
  
  pdf.setFontSize(12);
  pdf.text(`Total de Funcionários: ${employees.length}`, 20, 85);
  pdf.text(`Total de Hectares Trabalhados: ${totalHectares.toFixed(1)} ha`, 20, 95);
  pdf.text(`Total de Pagamentos: R$ ${totalEarnings.toFixed(2)}`, 20, 105);
  
  // Employee breakdown
  pdf.setFillColor(74, 85, 162);
  pdf.rect(20, 115, 170, 10, 'F');
  
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(10);
  pdf.text('FUNCIONÁRIO', 25, 122);
  pdf.text('HECTARES', 90, 122);
  pdf.text('TAXA/HA', 130, 122);
  pdf.text('TOTAL', 160, 122);
  
  let yPosition = 135;
  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(9);
  
  allEmployeeData.forEach((empData, index) => {
    if (index % 2 === 0) {
      pdf.setFillColor(245, 245, 245);
      pdf.rect(20, yPosition - 5, 170, 8, 'F');
    }
    
    const employee = employees.find(e => e.name === empData.employeeName);
    const rate = employee ? employeeRates[employee.id] || 0 : 0;
    
    pdf.text(empData.employeeName, 25, yPosition);
    pdf.text(`${empData.totalHectares.toFixed(1)} ha`, 90, yPosition);
    pdf.text(`R$ ${rate.toFixed(2)}`, 130, yPosition);
    pdf.text(`R$ ${empData.earnings.toFixed(2)}`, 160, yPosition);
    
    yPosition += 10;
  });
  
  // Total section
  pdf.setFillColor(74, 85, 162);
  pdf.rect(130, yPosition + 10, 60, 15, 'F');
  
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(14);
  pdf.text(`TOTAL GERAL: R$ ${totalEarnings.toFixed(2)}`, 135, yPosition + 20);
  
  // Footer
  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(8);
  pdf.text('TpDrones - Sistema de Gestão de Drones', 20, 280);
  pdf.text(`PIX: 517479060001055`, 120, 280);
  
  const filename = `relatorio_agregado_pagamentos_${new Date().toISOString().split('T')[0]}.pdf`;
  pdf.save(filename);
};

export const calculateEmployeeWorkData = (employees: Employee[], tasks: Task[], employeeRates: { [key: string]: number }): EmployeeWorkData[] => {
  return employees.map(employee => {
    const employeeWorkData: EmployeeWorkData = {
      employeeName: employee.name,
      totalHectares: 0,
      earnings: 0,
      taskDetails: []
    };
    
    tasks.forEach(task => {
      if (task.progressEntries && task.progressEntries.length > 0) {
        // Calculate work from progress entries
        task.progressEntries.forEach(entry => {
          if (entry.assignee === employee.name) {
            employeeWorkData.totalHectares += entry.hectares;
            employeeWorkData.taskDetails.push({
              taskTitle: task.title,
              client: task.client,
              hectares: entry.hectares,
              date: entry.date
            });
          }
        });
      } else if (task.assignee === employee.name && task.status === 'completed') {
        // Fallback for tasks without progress entries
        employeeWorkData.totalHectares += task.hectares;
        employeeWorkData.taskDetails.push({
          taskTitle: task.title,
          client: task.client,
          hectares: task.hectares,
          date: task.dueDate
        });
      }
    });
    
    const rate = employeeRates[employee.id] || 0;
    employeeWorkData.earnings = employeeWorkData.totalHectares * rate;
    
    return employeeWorkData;
  });
};

export const generateServiceReport = async (task: Task, completionData: any, clientHistory: Task[]) => {
  const pdf = new jsPDF();
  
  // Header with blue background
  pdf.setFillColor(74, 85, 162);
  pdf.rect(0, 0, 210, 50, 'F');
  
  // Company logo area
  pdf.setFillColor(255, 255, 255);
  pdf.rect(15, 10, 30, 30, 'F');
  
  // Add logo
  try {
    const logoImg = await loadImageFromUrl('/lovable-uploads/c02fcc86-f1bb-4bb6-b6b2-63f5680e34db.png');
    pdf.addImage(logoImg, 'PNG', 17, 12, 26, 26);
  } catch (error) {
    console.log('Logo não encontrado, continuando sem logo');
  }
  
  // Company info
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(18);
  pdf.text('RELATÓRIO DE EXECUÇÃO DE SERVIÇO', 50, 20);
  
  pdf.setFontSize(10);
  pdf.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, 50, 30);
  
  // Contact info
  pdf.setFontSize(11);
  pdf.setFont(undefined, 'bold');
  pdf.text('CONTATO:', 130, 17);
  pdf.setFont(undefined, 'normal');
  pdf.setFontSize(10);
  pdf.text('Tel: (21) 99744-7883', 130, 22);
  pdf.text('www.tpdrones.com.br', 130, 27);
  pdf.text('contato@tpdrones.com.br', 130, 32);
  
  // Client info
  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(16);
  pdf.text(task.client.toUpperCase(), 20, 70);
  pdf.setFontSize(12);
  pdf.text(task.location, 20, 80);
  
  // Service table
  pdf.setFillColor(74, 85, 162);
  pdf.rect(20, 90, 170, 10, 'F');
  
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(10);
  pdf.text('SERVIÇO', 25, 97);
  pdf.text('DESCRIÇÃO', 80, 97);
  pdf.text('VALORES', 150, 97);
  
  // Service details
  pdf.setTextColor(0, 0, 0);
  pdf.setFillColor(245, 245, 245);
  pdf.rect(20, 100, 170, 15, 'F');
  
  pdf.setFontSize(9);
  pdf.text(task.title, 25, 110);
  pdf.text(`${task.description} em ${task.hectares} ha`, 80, 110);
  pdf.text('R$ 250,00', 150, 105);
  pdf.text('por ha', 150, 112);
  
  // Photos section
  if (completionData?.photos && completionData.photos.length > 0) {
    let yPosition = 130;
    
    for (let i = 0; i < Math.min(completionData.photos.length, 2); i++) {
      const photo = completionData.photos[i];
      
      try {
        const imageData = await getImageData(photo);
        pdf.addImage(imageData, 'JPEG', 20 + (i * 85), yPosition, 80, 60);
      } catch (error) {
        console.error('Erro ao processar imagem:', error);
      }
    }
    
    yPosition += 70;
  }
  
  // Total
  pdf.setFillColor(74, 85, 162);
  pdf.rect(130, 250, 60, 15, 'F');
  
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(14);
  const total = task.hectares * 250;
  pdf.text(`TOTAL: R$ ${total.toFixed(2)}`, 135, 260);
  
  // Footer
  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(8);
  pdf.text('TpDrones - Sistema de Gestão de Drones', 20, 280);
  pdf.text(`PIX: 517479060001055`, 120, 280);
  
  const filename = `relatorio_${task.client.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
  pdf.save(filename);
};

const loadImageFromUrl = (url: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = reject;
    img.src = url;
  });
};

const getImageData = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        const maxWidth = 300;
        const maxHeight = 225;
        let { width, height } = img;
        
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};
