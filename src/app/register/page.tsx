"use client";

import axios from "axios";
import {
  Anchor,
  Container,
  Paper,
  Title,
  Text,
  TextInput,
  Button,
  Stack,
  Center,
  Transition,
  useMantineColorScheme,
} from "@mantine/core";
import Link from "next/link";
import { useMounted } from "@mantine/hooks";
import { useState, useEffect } from "react";
import { PasswordWithStrength } from "@/components/register/PasswordWithStrength";
import { InteractiveBackground } from "@/components/dashboard/InteractiveBackground";
import { useScramble } from "@/hooks/useScramble";
import { notifications } from "@mantine/notifications";
import { useRouter } from "next/navigation";

function RegisterPage() {
  const BASE_API = process.env.NEXT_PUBLIC_API_URL;
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [isFormValid, setIsFormValid] = useState(false);
  const mounted = useMounted();
  const { colorScheme } = useMantineColorScheme();

  const { displayText, isAnimationDone } = useScramble({
    text: "Join the Kingdom!",
    scrambleColor: colorScheme === "dark" ? "#555" : "#aaa",
  });

  useEffect(() => {
    const emailRegex = /^\S+@\S+\.\S+$/;
    const isEmailValid = emailRegex.test(formData.email);
    const isUsernameValid = formData.username.trim().length >= 3;
    const isPasswordValid = passwordStrength === 100;

    setIsFormValid(isEmailValid && isUsernameValid && isPasswordValid);
  }, [formData, passwordStrength]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(`${BASE_API}/api/users/add-player`, {
        Username: formData.username,
        Email: formData.email,
        Password: formData.password,
      });
      console.log("Registration successful:", response.data);
      notifications.show({
        title: "Registration Successful",
        message: "You will be redirected to the login page shortly.",
        color: "green",
      });
      setTimeout(() => {
        router.push("/");
      }, 2000);
    } catch (err) {
      console.error("Registration failed:", err);
      notifications.show({
        title: "Registration Failed",
        message: "Please try again.",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
      <>
        <InteractiveBackground colorScheme={colorScheme} />
        <Center
            style={{
              minHeight: "100vh",
              position: "relative",
              zIndex: 1,
              padding: "20px",
            }}
        >
          <Transition
              mounted={mounted}
              transition="fade-up"
              duration={800}
              timingFunction="ease-out"
          >
            {(styles) => (
                <Container size={460} my={40} w="100%" style={styles}>
                  <Title
                      ta="center"
                      c={colorScheme === "dark" ? "white" : "black"}
                      className={`medieval-title ${
                          isAnimationDone ? "title-shimmer" : ""
                      }`}
                      style={{
                        textShadow: "2px 2px 6px rgba(0,0,0,0.3)",
                        height: 48,
                        whiteSpace: "nowrap",
                      }}
                      fz={40}
                  >
                    {displayText}
                  </Title>

                  <Text c="dimmed" size="sm" ta="center" mt={5}>
                    Create your account to start your Monopoly adventure.
                  </Text>

                  <Paper
                      p={30}
                      mt={30}
                      radius="lg"
                      shadow="xl"
                      style={(theme) => ({
                        background:
                            colorScheme === "dark"
                                ? "rgba(26, 28, 30, 0.7)"
                                : "rgba(255, 255, 255, 0.6)",
                        backdropFilter: "blur(10px)",
                        border: `1px solid ${
                            colorScheme === "dark"
                                ? "rgba(255, 255, 255, 0.1)"
                                : "rgba(0, 0, 0, 0.1)"
                        }`,
                      })}
                  >
                    <form onSubmit={handleSubmit}>
                      <Stack>
                        <TextInput
                            label="Email Address"
                            placeholder="your@email.com"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                        <TextInput
                            label="Username"
                            placeholder="Your noble name"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            required
                        />
                        <PasswordWithStrength
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            onStrengthChange={setPasswordStrength}
                            required
                        />
                      </Stack>
                      <Button
                          type="submit"
                          fullWidth
                          mt="xl"
                          loading={loading}
                          variant="gradient"
                          gradient={{ from: "cyan", to: "blue" }}
                          size="md"
                          disabled={!isFormValid || loading}
                      >
                        Create Account
                      </Button>
                    </form>
                  </Paper>

                  <Text c="dimmed" ta="center" mt="md" size="sm">
                    Already have an account?{" "}
                    <Anchor component={Link} href="/" fw={700} c="cyan.4">
                      Sign In
                    </Anchor>
                  </Text>
                </Container>
            )}
          </Transition>
        </Center>
      </>
  );
}

export default RegisterPage;