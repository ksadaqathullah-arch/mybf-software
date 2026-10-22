import { redirect } from 'next/navigation';

export default function RegisterPage() {
  // Remove standalone register page and redirect directly to membership page with application modal open
  redirect('/membership?apply=true');
}
