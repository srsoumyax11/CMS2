import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/app/providers/AuthProvider';
import { useToast } from '@/components/ui/Toast';
import { FormField } from '@/components/ui/FormField';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { EvidenceUpload } from './EvidenceUpload';
import {
  studentRoleSchema,
  StudentRoleFormData,
  facultyRoleSchema,
  FacultyRoleFormData,
  wardenRoleSchema,
  WardenRoleFormData,
  parentLinkFormSchema,
  ParentLinkFormData,
} from '../schema';
import { onboardingApi } from '../api';

interface FormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const StudentRoleForm: React.FC<FormProps> = ({ onSuccess, onCancel }) => {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const [evidenceUrl, setEvidenceUrl] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<StudentRoleFormData>({
    resolver: zodResolver(studentRoleSchema),
    defaultValues: {
      fullName: user?.fullName || '',
      admissionYear: new Date().getFullYear(),
    },
  });

  const onSubmit = async (data: StudentRoleFormData) => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      await onboardingApi.requestStudentRole({ ...data, evidenceUrl });
      showSuccess('Application submitted. We will notify you when it is reviewed.');
      onSuccess();
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to submit student application.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FormField label="Full Name" error={errors.fullName?.message} required>
        <Input type="text" {...register('fullName')} readOnly className="bg-muted" />
      </FormField>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="Roll Number" error={errors.rollNumber?.message} required>
          <Input type="text" placeholder="e.g. 21CS045" {...register('rollNumber')} />
        </FormField>

        <FormField label="Registration Number" error={errors.registrationNumber?.message} required>
          <Input type="text" placeholder="e.g. REG-2021-9921" {...register('registrationNumber')} />
        </FormField>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FormField label="Department" error={errors.department?.message} required>
          <Input type="text" placeholder="e.g. Computer Science" {...register('department')} />
        </FormField>

        <FormField label="Course / Program" error={errors.course?.message} required>
          <Input type="text" placeholder="e.g. B.Tech CS" {...register('course')} />
        </FormField>

        <FormField label="Admission Year" error={errors.admissionYear?.message} required>
          <Input type="number" {...register('admissionYear', { valueAsNumber: true })} />
        </FormField>
      </div>

      <EvidenceUpload onUploadSuccess={setEvidenceUrl} onRemove={() => setEvidenceUrl('')} />

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" isLoading={isSubmitting}>
          Submit Student Application
        </Button>
      </div>
    </form>
  );
};

export const FacultyRoleForm: React.FC<FormProps> = ({ onSuccess, onCancel }) => {
  const { showSuccess, showError } = useToast();
  const [evidenceUrl, setEvidenceUrl] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FacultyRoleFormData>({
    resolver: zodResolver(facultyRoleSchema),
  });

  const onSubmit = async (data: FacultyRoleFormData) => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      await onboardingApi.requestFacultyRole({ ...data, evidenceUrl });
      showSuccess('Application submitted. We will notify you when it is reviewed.');
      onSuccess();
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to submit faculty application.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FormField label="Faculty Employee Code" error={errors.employeeCode?.message} required>
        <Input type="text" placeholder="e.g. EMP-FAC-991" {...register('employeeCode')} />
      </FormField>

      <FormField label="Academic Department" error={errors.department?.message} required>
        <Input type="text" placeholder="e.g. Department of Mechanical Engineering" {...register('department')} />
      </FormField>

      <EvidenceUpload onUploadSuccess={setEvidenceUrl} onRemove={() => setEvidenceUrl('')} />

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" isLoading={isSubmitting}>
          Submit Faculty Application
        </Button>
      </div>
    </form>
  );
};

export const WardenRoleForm: React.FC<FormProps> = ({ onSuccess, onCancel }) => {
  const { showSuccess, showError } = useToast();
  const [evidenceUrl, setEvidenceUrl] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<WardenRoleFormData>({
    resolver: zodResolver(wardenRoleSchema),
  });

  const onSubmit = async (data: WardenRoleFormData) => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      await onboardingApi.requestWardenRole({ ...data, evidenceUrl });
      showSuccess('Application submitted. We will notify you when it is reviewed.');
      onSuccess();
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to submit warden application.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FormField label="Warden Staff ID / Employee Code" error={errors.employeeCode?.message} required>
        <Input type="text" placeholder="e.g. EMP-WRD-102" {...register('employeeCode')} />
      </FormField>

      <FormField label="Assigned Hostel Name" error={errors.hostelName?.message} required>
        <Input type="text" placeholder="e.g. Hostel Block A (Ganga)" {...register('hostelName')} />
      </FormField>

      <EvidenceUpload onUploadSuccess={setEvidenceUrl} onRemove={() => setEvidenceUrl('')} />

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" isLoading={isSubmitting}>
          Submit Warden Application
        </Button>
      </div>
    </form>
  );
};

export const ParentLinkForm: React.FC<FormProps> = ({ onSuccess, onCancel }) => {
  const { showSuccess, showError } = useToast();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ParentLinkFormData>({
    resolver: zodResolver(parentLinkFormSchema),
  });

  const onSubmit = async (data: ParentLinkFormData) => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      await onboardingApi.linkParentAccount(data);
      showSuccess('Parent link request submitted successfully!');
      onSuccess();
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to submit parent link request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FormField label="Student Admission Number" error={errors.admissionNumber?.message} required>
        <Input type="text" placeholder="e.g. ADM-2023-8819" {...register('admissionNumber')} />
      </FormField>

      <FormField label="Student Date of Birth" error={errors.studentDob?.message} required>
        <Input type="date" {...register('studentDob')} />
      </FormField>

      <FormField label="Relation to Student" error={errors.relation?.message} required>
        <Input type="text" placeholder="e.g. Father, Mother, Guardian" {...register('relation')} />
      </FormField>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" isLoading={isSubmitting}>
          Link Student Profile
        </Button>
      </div>
    </form>
  );
};
