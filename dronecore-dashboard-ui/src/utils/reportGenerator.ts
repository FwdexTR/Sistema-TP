
import jsPDF from 'jspdf';

interface Task {
  id: string;
  title: string;
  description: string;
  assignee: string;
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
  location: string;
  drone: string;
}

interface CompletionData {
  photos: File[];
  notes: string;
  completedAt: string;
  completedBy: string;
}

export const generateTaskReport = async (task: Task, completionData: CompletionData) => {
  const pdf = new jsPDF();
  
  // Header
  pdf.setFontSize(20);
  pdf.text('DroneCore - Relatório de Execução', 20, 30);
  
  // Task details
  pdf.setFontSize(14);
  pdf.text('Detalhes da Tarefa:', 20, 50);
  
  pdf.setFontSize(10);
  pdf.text(`ID da Tarefa: ${task.id}`, 20, 65);
  pdf.text(`Título: ${task.title}`, 20, 75);
  pdf.text(`Descrição: ${task.description}`, 20, 85);
  pdf.text(`Local: ${task.location}`, 20, 95);
  pdf.text(`Drone Utilizado: ${task.drone}`, 20, 105);
  pdf.text(`Responsável: ${task.assignee}`, 20, 115);
  pdf.text(`Data de Execução: ${new Date(task.dueDate).toLocaleDateString('pt-BR')}`, 20, 125);
  pdf.text(`Concluído em: ${new Date(completionData.completedAt).toLocaleDateString('pt-BR')} às ${new Date(completionData.completedAt).toLocaleTimeString('pt-BR')}`, 20, 135);
  
  // Execution notes
  if (completionData.notes) {
    pdf.setFontSize(14);
    pdf.text('Observações da Execução:', 20, 155);
    pdf.setFontSize(10);
    
    const splitNotes = pdf.splitTextToSize(completionData.notes, 170);
    pdf.text(splitNotes, 20, 170);
  }
  
  // Photos section
  if (completionData.photos.length > 0) {
    let yPosition = completionData.notes ? 200 : 170;
    
    pdf.setFontSize(14);
    pdf.text('Fotos da Execução:', 20, yPosition);
    yPosition += 20;
    
    for (let i = 0; i < completionData.photos.length; i++) {
      const photo = completionData.photos[i];
      
      try {
        const imageData = await getImageData(photo);
        
        // Add new page if needed
        if (yPosition > 250) {
          pdf.addPage();
          yPosition = 30;
        }
        
        pdf.addImage(imageData, 'JPEG', 20, yPosition, 80, 60);
        pdf.setFontSize(8);
        pdf.text(`Foto ${i + 1}`, 20, yPosition + 65);
        
        yPosition += 80;
      } catch (error) {
        console.error('Erro ao processar imagem:', error);
      }
    }
  }
  
  // Footer
  const pageCount = pdf.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    pdf.setPage(i);
    pdf.setFontSize(8);
    pdf.text(`Página ${i} de ${pageCount}`, 20, 285);
    pdf.text('DroneCore - Sistema de Gestão de Drones', 120, 285);
  }
  
  // Save PDF
  const filename = `relatorio_${task.id}_${new Date().toISOString().split('T')[0]}.pdf`;
  pdf.save(filename);
};

const getImageData = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Resize image to fit PDF
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
