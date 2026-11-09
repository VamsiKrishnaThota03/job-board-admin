import { redirect } from 'next/navigation';

// Job creation happens in a modal on the home page
export default function CreateJobPage() {
  redirect('/?create=true');
}
