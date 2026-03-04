'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useCreatePoll } from '@/hooks/usePolls';
import { Plus, Trash2, Loader2 } from 'lucide-react';

interface PollFormProps {
  eventId: string;
  onSuccess?: () => void;
}

export function PollForm({ eventId, onSuccess }: PollFormProps) {
  const [options, setOptions] = useState<string[]>(['', '']);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const createPoll = useCreatePoll();

  const addOption = () => {
    setOptions([...options, '']);
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const onSubmit = async (data: any) => {
    const validOptions = options.filter(o => o.trim() !== '');
    
    if (validOptions.length < 2) {
      return;
    }

    await createPoll.mutateAsync({
      event_id: eventId,
      question: data.question,
      options: validOptions,
    });

    reset();
    setOptions(['', '']);
    onSuccess?.();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Question
        </label>
        <input
          {...register('question', { required: true })}
          type="text"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          placeholder="Enter your poll question"
        />
        {errors.question && (
          <p className="text-red-500 text-sm mt-1">Question is required</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Options
        </label>
        <div className="space-y-2">
          {options.map((option, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                type="text"
                value={option}
                onChange={(e) => {
                  const newOptions = [...options];
                  newOptions[index] = e.target.value;
                  setOptions(newOptions);
                }}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder={`Option ${index + 1}`}
              />
              {options.length > 2 && (
                <button
                  type="button"
                  onClick={() => removeOption(index)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 size={18} />
                </button>
              )}
            </div>
          ))}
        </div>
        
        <button
          type="button"
          onClick={addOption}
          className="mt-2 flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700"
        >
          <Plus size={16} />
          Add Option
        </button>
      </div>

      <button
        type="submit"
        disabled={createPoll.isPending}
        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50"
      >
        {createPoll.isPending && <Loader2 size={18} className="animate-spin" />}
        Create Poll
      </button>
    </form>
  );
}
