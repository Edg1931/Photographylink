import { Container, Button } from "@/components/ui";

export default function NotFound() {
  return (
    <Container className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <p className="font-display text-7xl font-semibold text-amber-brand">404</p>
      <h1 className="mt-4 font-display text-2xl font-semibold">
        This frame didn&apos;t develop.
      </h1>
      <p className="mt-2 max-w-md text-bone/60">
        The page you&apos;re looking for isn&apos;t here. Let&apos;s get you back
        to the network.
      </p>
      <div className="mt-6 flex gap-3">
        <Button href="/">Back home</Button>
        <Button href="/photographers" variant="outline">
          Browse photographers
        </Button>
      </div>
    </Container>
  );
}
