'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCourse } from '@/hooks/useCourses';
import { Loader2, ArrowLeft, Pencil, BookOpen } from 'lucide-react';
import type { CoursePhase, CourseCertificate } from '@/types/course';

export default function CourseViewPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const { data: course, isLoading, error } = useCourse(id);

  if (isLoading || !course) {
    return (
      <div className="flex items-center justify-center rounded-xl border border-gray-200 bg-white py-20 shadow-sm">
        <Loader2 className="animate-spin text-primary-500" size={32} aria-hidden />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
        Failed to load course. <Link href="/dashboard/courses" className="underline">Back to courses</Link>
      </div>
    );
  }

  const highlights = course.highlights ?? [];
  const phases = course.phases ?? [];
  const benefits = course.benefits ?? [];
  const audience = course.audience ?? [];
  const careerOutcomes = course.career_outcomes ?? [];
  const certificate = course.certificate as CourseCertificate | null | undefined;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/courses"
            className="inline-flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft size={18} />
            Courses
          </Link>
          <span className="text-gray-300">/</span>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">{course.title}</h1>
        </div>
        <Link
          href={`/dashboard/courses/${id}/edit`}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 font-medium text-gray-700 shadow-sm hover:bg-gray-50"
        >
          <Pencil size={18} />
          Edit
        </Link>
      </div>

      <div className="space-y-8">
        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Overview</h2>
          <div className="flex flex-wrap gap-2 mb-3">
            <span
              className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                course.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}
            >
              {course.status}
            </span>
            <span className="text-sm text-gray-500">Display order: {course.display_order ?? 0}</span>
          </div>
          {course.short_description && (
            <p className="text-gray-600 mb-2">{course.short_description}</p>
          )}
          {course.full_description && (
            <div className="mt-2 text-gray-600 whitespace-pre-wrap">{course.full_description}</div>
          )}
        </section>

        {highlights.length > 0 && (
          <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Highlights</h2>
            <dl className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {highlights.map((h: { label: string; value: string }, i: number) => (
                <div key={i} className="flex flex-col">
                  <dt className="text-sm font-medium text-gray-500">{h.label}</dt>
                  <dd className="text-gray-900">{h.value}</dd>
                </div>
              ))}
            </dl>
          </section>
        )}

        {phases.length > 0 && (
          <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Phases / Modules</h2>
            <div className="space-y-4">
              {phases.map((phase: CoursePhase, i: number) => (
                <div key={phase.id ?? i} className="border-l-2 border-primary-200 pl-4">
                  <h3 className="font-medium text-gray-900">{phase.title}</h3>
                  {phase.subtitle && <p className="text-sm text-gray-600 mt-0.5">{phase.subtitle}</p>}
                  {phase.phase_items && phase.phase_items.length > 0 && (
                    <ul className="mt-2 list-disc list-inside text-sm text-gray-600 space-y-1">
                      {phase.phase_items.map((item: { text: string; item_type?: string }, j: number) => (
                        <li key={j}>
                          <span className="text-gray-500">[{item.item_type ?? 'item'}]</span> {item.text}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {benefits.length > 0 && (
          <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Benefits</h2>
            <ul className="space-y-2">
              {benefits.map((b: { title: string; description?: string }, i: number) => (
                <li key={i}>
                  <span className="font-medium text-gray-900">{b.title}</span>
                  {b.description && <p className="text-sm text-gray-600 mt-0.5">{b.description}</p>}
                </li>
              ))}
            </ul>
          </section>
        )}

        {audience.length > 0 && (
          <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Who should attend</h2>
            <ul className="space-y-2">
              {audience.map((a: { title: string; description?: string }, i: number) => (
                <li key={i}>
                  <span className="font-medium text-gray-900">{a.title}</span>
                  {a.description && <p className="text-sm text-gray-600 mt-0.5">{a.description}</p>}
                </li>
              ))}
            </ul>
          </section>
        )}

        {careerOutcomes.length > 0 && (
          <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Career outcomes</h2>
            <ul className="list-disc list-inside text-gray-600 space-y-1">
              {careerOutcomes.map((c: { text: string }, i: number) => (
                <li key={i}>{c.text}</li>
              ))}
            </ul>
          </section>
        )}

        {certificate && (certificate.title || certificate.provider || certificate.description) && (
          <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Certificate</h2>
            {certificate.title && <p className="font-medium text-gray-900">{certificate.title}</p>}
            {certificate.provider && <p className="text-sm text-gray-600">Provider: {certificate.provider}</p>}
            {certificate.description && <p className="mt-2 text-gray-600">{certificate.description}</p>}
          </section>
        )}
      </div>
    </div>
  );
}
