"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from 'next/link';
import {
  Anchor,
  Container,
  Paper,
  Title,
  Text,
  TextInput,
  PasswordInput,
  Button,
  Stack,
  Center,
  Divider,
  Transition,
} from "@mantine/core";
import { useMounted } from "@mantine/hooks";
import { IconAt, IconLock, IconBrandWindows } from "@tabler/icons-react";

export default function LoginPage() {
  const router = useRouter();
  const mounted = useMounted();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEmailLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (result?.ok) {
      router.push("/dashboard");
    } else {
      setError("Email atau password salah. Silakan coba lagi.");
    }
    setLoading(false);
  };

  const handleMicrosoftLogin = () => {
    setLoading(true);
    signIn("azure-ad", { callbackUrl: "/dashboard" }, { prompt: "login" });

  };

  return (
      <Center style={{ minHeight: '100vh' }}>
        <Container size={420} my={40}>
          <Transition mounted={mounted} transition="fade" duration={500} timingFunction="ease">
            {(styles) => (
                <div style={styles}>
                  <Title ta="center" className="medieval-title">
                    Welcome Back, Noble!
                  </Title>
                  <Text c="dimmed" size="sm" ta="center" mt={5}>
                    Enter the kingdom's gates with your credentials.
                  </Text>

                  <Paper withBorder shadow="md" p={30} mt={30} radius="md">
                    <form onSubmit={handleEmailLogin}>
                      <Stack>
                        <TextInput
                            leftSection={<IconAt size={16} />}
                            label="Email Address"
                            placeholder="your@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <PasswordInput
                            leftSection={<IconLock size={16} />}
                            label="Password"
                            placeholder="Your secret passphrase"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        {error && (
                            <Text c="red" size="sm" ta="center">
                              {error}
                            </Text>
                        )}
                        <Button type="submit" fullWidth mt="md" loading={loading}>
                          Sign In
                        </Button>
                      </Stack>
                    </form>

                    <Divider label="Or continue with" labelPosition="center" my="lg" />

                    <Button
                        onClick={handleMicrosoftLogin}
                        fullWidth
                        variant="default"
                        color="gray"
                        leftSection={<IconBrandWindows size={18} />}
                        loading={loading}
                    >
                      Sign In with Microsoft
                    </Button>
                  </Paper>

                  <Text ta="center" mt="md" size="sm">
                    Don't have an account yet?{' '}
                    <Anchor component={Link} href="/register" fw={700}>
                      Create one
                    </Anchor>
                  </Text>

                </div>
            )}
          </Transition>
        </Container>
      </Center>
  );
}