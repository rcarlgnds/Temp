"use client";

import { signIn } from "next-auth/react";
import React, { useState } from "react";
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
  useMantineColorScheme
} from "@mantine/core";
import { useMounted } from "@mantine/hooks";
import { IconAt, IconLock, IconBrandWindows } from "@tabler/icons-react";
import { InteractiveBackground } from "@/components/dashboard/InteractiveBackground";
import { useScramble } from "@/hooks/useScramble";

export default function LoginPage() {
  const router = useRouter();
  const mounted = useMounted();
  const { colorScheme } = useMantineColorScheme();

  const { displayText, isAnimationDone } = useScramble({
    text: 'Welcome Back, Noble!',
    scrambleColor: colorScheme === 'dark' ? '#555' : '#aaa'
  });

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
      <>
        <InteractiveBackground colorScheme={colorScheme} />
        <Center style={{ minHeight: '100vh', position: 'relative', zIndex: 1, padding: '20px' }}>
          <Container size={460} my={40} w="100%">
            <Transition mounted={mounted} transition="fade-up" duration={800} timingFunction="ease-out">
              {(styles) => (
                  <div style={styles}>
                    <Title
                        ta="center"
                        c={colorScheme === 'dark' ? "white" : "black"}
                        className={`medieval-title ${isAnimationDone ? 'title-shimmer' : ''}`}
                        style={{ textShadow: '2px 2px 6px rgba(0,0,0,0.3)', height: 48, whiteSpace: 'nowrap' }}
                        fz={40}
                    >
                      {displayText}
                    </Title>
                    <Text c="dimmed" size="sm" ta="center" mt={5}>
                      Enter the kingdom's gates with your credentials.
                    </Text>

                    <Paper
                        p={30}
                        mt={30}
                        radius="lg"
                        shadow="xl"
                        style={(theme) => ({
                          background: colorScheme === 'dark' ? 'rgba(26, 28, 30, 0.7)' : 'rgba(255, 255, 255, 0.6)',
                          backdropFilter: 'blur(10px)',
                          border: `1px solid ${colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                        })}
                    >
                      <form onSubmit={handleEmailLogin}>
                        <Stack>
                          <TextInput
                              label="Email Address"
                              placeholder="your@email.com"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              required
                              leftSection={<IconAt size={16} />}
                          />
                          <PasswordInput
                              label="Password"
                              placeholder="Your secret passphrase"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              required
                              leftSection={<IconLock size={16} />}
                          />
                          {error && (
                              <Text c="red.5" size="sm" ta="center">
                                {error}
                              </Text>
                          )}
                          <Button
                              type="submit"
                              fullWidth
                              mt="md"
                              loading={loading}
                              variant="gradient"
                              gradient={{ from: 'cyan', to: 'blue' }}
                              size="md"
                          >
                            Sign In
                          </Button>
                        </Stack>
                      </form>
                      <Divider label="Or continue with" labelPosition="center" my="lg" />
                      <Button
                          onClick={handleMicrosoftLogin}
                          fullWidth
                          variant="default"
                          leftSection={<IconBrandWindows size={18} />}
                          loading={loading}
                          size="md"
                      >
                        Sign In with Microsoft
                      </Button>
                    </Paper>
                    <Text c="dimmed" ta="center" mt="md" size="sm">
                      Don't have an account yet?{' '}
                      <Anchor component={Link} href="/register" fw={700} c="cyan.4">
                        Create one
                      </Anchor>
                    </Text>
                  </div>
              )}
            </Transition>
          </Container>
        </Center>
      </>
  );
}