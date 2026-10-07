import { redirect } from 'next/navigation'

/** La tienda pasó a llamarse Planeta Shop; los enlaces antiguos siguen valiendo. */
export default function ColchonetasPage() {
  redirect('/planeta-shop')
}
