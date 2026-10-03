import { prisma } from '../config/prisma';

export class ParentService {
  async requestParentLink(parentUserId: string, admissionNo: string, dateOfBirth: string, relationship: string) {
    // Find matching student by admissionNo and DOB
    const student = await prisma.students.findFirst({
      where: {
        admission_no: admissionNo,
        date_of_birth: new Date(dateOfBirth),
      },
    });

    if (!student) {
      throw new Error('No matching student found for given Admission No and Date of Birth');
    }

    // Ensure guardian record exists for parent user
    let guardian = await prisma.guardians.findUnique({
      where: { user_id: parentUserId },
    });

    if (!guardian) {
      guardian = await prisma.guardians.create({
        data: { user_id: parentUserId },
      });
    }

    return await prisma.student_guardians.create({
      data: {
        student_id: student.user_id,
        guardian_id: parentUserId,
        relation: relationship,
      },
    });
  }

  async decideParentOutpass(outpassId: string, parentUserId: string, status: 'approved' | 'rejected', remarks?: string) {
    const outpass = await prisma.outpass_requests.findUnique({
      where: { id: outpassId },
    });

    if (!outpass) {
      throw new Error('Outpass request not found');
    }

    return await prisma.outpass_requests.update({
      where: { id: outpassId },
      data: {
        status,
        decided_by: parentUserId,
        decided_at: new Date(),
        decision_note: remarks || null,
      },
    });
  }

  async initiateFeePayment(parentUserId: string, invoiceId: string, paymentMethod = 'upi') {
    const invoice = await prisma.invoices.findUnique({
      where: { id: invoiceId },
      include: {
        invoice_items: true,
      },
    });

    if (!invoice) {
      throw new Error('Invoice not found');
    }

    const gatewaySessionId = `pay_${crypto.randomUUID().slice(0, 12)}`;
    const checkoutUrl = `https://checkout.paygate.com/pay/${gatewaySessionId}`;

    return {
      invoiceId: invoice.id,
      gatewaySessionId,
      checkoutUrl,
      paymentMethod,
    };
  }
}

export const parentService = new ParentService();
