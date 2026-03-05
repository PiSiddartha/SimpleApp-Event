import { redirect } from 'next/navigation';

export default function PollsRedirect() {
  redirect('/dashboard/polls');
}
