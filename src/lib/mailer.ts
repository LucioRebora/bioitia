import nodemailer from "nodemailer";
import { jsPDF } from "jspdf";
import "jspdf-autotable";

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

export async function generateBudgetPDF(budget: any) {
  // @ts-ignore - jspdf-autotable adds autoTable to jsPDF
  const doc = new jsPDF();

  // Colores
  const primaryColor = [26, 32, 44]; // #1a202c
  const secondaryColor = [113, 128, 150]; // #718096

  // Logo y Cabecera (Texto en lugar de imagen para evitar problemas de carga en Vercel)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text("LB LAB", 20, 25);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.text("Bolivar 1002 | Tel: 3446-434574", 20, 32);
  doc.text("laboratorio@lblab.com.ar", 20, 37);

  // Cuadro de Presupuesto
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text("PRESUPUESTO", 140, 25);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  const fecha = new Date(budget.createdAt).toLocaleDateString('es-AR');
  doc.text(`Fecha: ${fecha}`, 140, 32);

  // Línea divisoria
  doc.setDrawColor(237, 242, 247);
  doc.line(20, 45, 190, 45);

  // Info del Paciente
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Detalles del Paciente:", 20, 55);

  doc.setFont("helvetica", "normal");
  doc.text(`Paciente: ${budget.paciente || "N/A"}`, 20, 62);
  doc.text(`Email: ${budget.email || "N/A"}`, 20, 67);
  doc.text(`Plan: ${budget.planNombre || "Personalizado"}`, 120, 62);
  doc.text(`Teléfono: ${budget.telefono || "N/A"}`, 120, 67);

  // Tabla de Estudios
  const tableRows = budget.items.map((item: any) => [
    item.nombre,
    `$${item.valor.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`
  ]);

  // @ts-ignore
  doc.autoTable({
    startY: 75,
    head: [['Estudio / Análisis Clínico', 'Costo']],
    body: tableRows,
    theme: 'striped',
    headStyles: { fillColor: primaryColor, fontSize: 10, fontStyle: 'bold' },
    columnStyles: {
      0: { cellWidth: 130 },
      1: { cellWidth: 40, halign: 'right' }
    },
    styles: { font: "helvetica", fontSize: 9 }
  });

  // Total
  // @ts-ignore
  const finalY = doc.lastAutoTable.finalY + 15;
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("TOTAL:", 130, finalY);
  doc.setFontSize(16);
  doc.text(`$${budget.total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`, 190, finalY, { align: 'right' });

  // Footer
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  const footerY = 260;
  doc.text("• Este presupuesto tiene validez por 30 días.", 20, footerY);
  doc.text("• Los valores incluyen IVA.", 20, footerY + 5);
  doc.text("• LB LAB – Comprometidos con la calidad y la seguridad.", 20, footerY + 15);

  // Retornar como Buffer para nodemailer
  const arrayBuffer = doc.output("arraybuffer");
  return Buffer.from(arrayBuffer);
}

export const sendBudgetEmail = async (budget: any) => {
  if (!budget.email) throw new Error("El presupuesto no tiene un email de destino.");

  const pdfBuffer = await generateBudgetPDF(budget);

  const htmlContent = `
    <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px;">
      <h2 style="color: #1a202c;">Presupuesto de Análisis Clínicos</h2>
      <p>Hola <strong>${budget.paciente || "Paciente"}</strong>,</p>
      <p>Adjuntamos el presupuesto solicitado por un total de <strong>$${budget.total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</strong>.</p>
      <p>Quedamos a su disposición.</p>
      <hr style="border: none; border-top: 1px solid #edf2f7; margin: 20px 0;">
      <p style="font-size: 12px; color: #718096;">LB LAB | bio.itia</p>
    </div>
  `;

  return transporter.sendMail({
    from: `"LB Lab" <${process.env.GMAIL_USER}>`,
    to: budget.email,
    subject: `Presupuesto de Análisis Clínicos - ${budget.paciente || "LB Lab"}`,
    html: htmlContent,
    attachments: [
      {
        filename: `Presupuesto_${budget.paciente?.replace(/\s+/g, '_') || 'LB_Lab'}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf'
      }
    ]
  });
};
