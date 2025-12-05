import React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { ResumeData } from '../types/resume';

interface ResumeFormProps {
    initialData?: ResumeData;
    onSubmit: (data: ResumeData) => void;
    isLoading?: boolean;
}

export const ResumeForm: React.FC<ResumeFormProps> = ({ initialData, onSubmit, isLoading }) => {
    const { register, control, handleSubmit, formState: { errors } } = useForm<ResumeData>({
        defaultValues: initialData || {
            personal_info: { name: '', email: '', phone: '' },
            experience: [{ company: '', role: '', duration: '', bullets: [''] }],
            education: [{ institution: '', degree: '', year: '' }],
            skills: []
        }
    });

    const { fields: expFields, append: appendExp, remove: removeExp } = useFieldArray({
        control,
        name: 'experience'
    });

    const { fields: eduFields, append: appendEdu, remove: removeEdu } = useFieldArray({
        control,
        name: 'education'
    });

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="resume-form">
            <section className="form-section">
                <h2>Personal Information</h2>
                <input {...register('personal_info.name', { required: true })} placeholder="Full Name *" />
                {errors.personal_info?.name && <span className="error">Name is required</span>}

                <input {...register('personal_info.email', { required: true })} placeholder="Email *" type="email" />
                {errors.personal_info?.email && <span className="error">Email is required</span>}

                <input {...register('personal_info.phone', { required: true })} placeholder="Phone *" />
                <input {...register('personal_info.linkedin')} placeholder="LinkedIn URL" />
                <input {...register('personal_info.github')} placeholder="GitHub URL" />
                <input {...register('personal_info.location')} placeholder="Location" />
            </section>

            <section className="form-section">
                <h2>Professional Summary</h2>
                <textarea {...register('summary')} placeholder="Brief professional summary (2-3 sentences)" rows={3} />
            </section>

            <section className="form-section">
                <h2>Experience</h2>
                {expFields.map((field, index) => (
                    <div key={field.id} className="array-item">
                        <input {...register(`experience.${index}.company`, { required: true })} placeholder="Company *" />
                        <input {...register(`experience.${index}.role`, { required: true })} placeholder="Role *" />
                        <input {...register(`experience.${index}.duration`, { required: true })} placeholder="Duration (e.g., Jan 2020 - Present) *" />
                        <input {...register(`experience.${index}.location`)} placeholder="Location" />

                        <div className="bullets-section">
                            <textarea
                                {...register(`experience.${index}.bullets.0`, { required: true })}
                                placeholder="Achievement bullet 1 *"
                                rows={2}
                            />
                            <textarea {...register(`experience.${index}.bullets.1`)} placeholder="Achievement bullet 2" rows={2} />
                            <textarea {...register(`experience.${index}.bullets.2`)} placeholder="Achievement bullet 3" rows={2} />
                        </div>

                        {expFields.length > 1 && (
                            <button type="button" onClick={() => removeExp(index)} className="remove-btn">Remove</button>
                        )}
                    </div>
                ))}
                <button type="button" onClick={() => appendExp({ company: '', role: '', duration: '', bullets: [''] })} className="add-btn">
                    + Add Experience
                </button>
            </section>

            <section className="form-section">
                <h2>Education</h2>
                {eduFields.map((field, index) => (
                    <div key={field.id} className="array-item">
                        <input {...register(`education.${index}.institution`, { required: true })} placeholder="Institution *" />
                        <input {...register(`education.${index}.degree`, { required: true })} placeholder="Degree *" />
                        <input {...register(`education.${index}.year`, { required: true })} placeholder="Year *" />
                        <input {...register(`education.${index}.gpa`)} placeholder="GPA (optional)" />

                        {eduFields.length > 1 && (
                            <button type="button" onClick={() => removeEdu(index)} className="remove-btn">Remove</button>
                        )}
                    </div>
                ))}
                <button type="button" onClick={() => appendEdu({ institution: '', degree: '', year: '' })} className="add-btn">
                    + Add Education
                </button>
            </section>

            <section className="form-section">
                <h2>Skills</h2>
                <textarea
                    {...register('skills')}
                    placeholder="Enter skills separated by commas (e.g., Python, React, AWS)"
                    rows={3}
                />
            </section>

            <button type="submit" disabled={isLoading} className="submit-btn">
                {isLoading ? 'Generating...' : 'Generate PDF'}
            </button>
        </form>
    );
};
