import { Container } from "@/components/ui";
import { AuthForm } from "@/components/AuthForm";
import { brand } from "@/lib/brand";

export const metadata = { title: `Sign up · ${brand.name}` };

export default function SignupPage() {
  return (
    <Container className="py-16 lg:py-24">
      <AuthForm mode="signup" />
    </Container>
  );
}
