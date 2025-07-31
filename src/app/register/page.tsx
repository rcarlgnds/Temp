"use client";

import React, { useState } from "react";
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
} from "@mantine/core";
import Link from 'next/link';
import { useMounted} from "@mantine/hooks"

import { PasswordWithStrength } from "@/components/register/PasswordWithStrength";


function RegisterPage() {
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const mounted = useMounted();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(
          "http://localhost:6969/api/users/add-player",
          {
            Username: formData.username,
            Email: formData.email,
            Password: formData.password,
          }
      );
      console.log("Registration successful:", response.data);
    } catch (err) {
      console.error("Registration failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
      <Center style={{ minHeight: '100vh' }}>
        <Transition mounted={mounted} transition="fade" duration={500} timingFunction="ease">
          {(styles) => (
              <Container size={420} my={40} style={styles}>
                <Title ta="center" className="medieval-title">
                  Join the Kingdom!
                </Title>
                <Text c="dimmed" size="sm" ta="center" mt={5}>
                  Create your account to start your Monopoly adventure.
                </Text>
                <Paper withBorder shadow="md" p={30} mt={30} radius="md">
                  <form onSubmit={handleSubmit}>
                    <Stack>
                      <TextInput label="Email Address" placeholder="your@email.com" name="email" value={formData.email} onChange={handleChange} required />
                      <TextInput label="Username" placeholder="Your noble name" name="username" value={formData.username} onChange={handleChange} required />
                      <PasswordWithStrength label="Password" placeholder="Your secret passphrase" name="password" value={formData.password} onChange={handleChange} required />
                    </Stack>
                    <Button type="submit" fullWidth mt="xl" loading={loading}>
                      Create Account
                    </Button>
                  </form>
                </Paper>

                <Text ta="center" mt="md" size="sm">
                  Already have an account?{' '}
                  <Anchor component={Link} href="/" fw={700}>
                    Sign In
                  </Anchor>
                </Text>
              </Container>
          )}
        </Transition>
      </Center>
  );
}

export default RegisterPage;