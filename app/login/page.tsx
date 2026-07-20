import { Container } from "@/components/ui";
import { AuthForm } from "@/components/AuthForm";
import { brand } from "@/lib/brand";

export const metadata = { title: `Log in · ${brand.name}` };

export default function LoginPage() {
  return (
    <Container className="py-16 lg:py-24">
      <AuthForm mode="login" />
    </Container>
  );
}
