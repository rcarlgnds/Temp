"use client";

import { Box, Progress, PasswordInput, Text, Popover, Stack, PasswordInputProps } from '@mantine/core';
import { IconX, IconCheck } from '@tabler/icons-react';
import { useState, useEffect } from 'react';

function PasswordRequirement({ meets, label }: { meets: boolean; label: string }) {
    return (
        <Text
            color={meets ? 'teal' : 'red'}
            style={{ display: 'flex', alignItems: 'center' }}
            mt={7}
            size="sm"
        >
            {meets ? <IconCheck size={14} /> : <IconX size={14} />} <Box ml={10}>{label}</Box>
        </Text>
    );
}

const requirements = [
    { re: /[0-9]/, label: 'Includes number' },
    { re: /[a-z]/, label: 'Includes lowercase letter' },
    { re: /[A-Z]/, label: 'Includes uppercase letter' },
    { re: /[$&+,:;=?@#|'<>.^*()%!-]/, label: 'Includes special symbol' },
];

function getStrength(password: string) {
    let multiplier = password.length > 7 ? 0 : 1;
    requirements.forEach((requirement) => {
        if (!requirement.re.test(password)) {
            multiplier += 1;
        }
    });
    return Math.max(100 - (100 / (requirements.length + 1)) * multiplier, 10);
}

interface PasswordWithStrengthProps extends PasswordInputProps {
    onStrengthChange?: (strength: number) => void;
}

export function PasswordWithStrength({ onStrengthChange, ...props }: PasswordWithStrengthProps) {
    const [popoverOpened, setPopoverOpened] = useState(false);

    const value = props.value || '';

    useEffect(() => {
        if (onStrengthChange) {
            onStrengthChange(getStrength(value as string));
        }
    }, [value, onStrengthChange]);

    const checks = requirements.map((requirement, index) => (
        <PasswordRequirement key={index} label={requirement.label} meets={requirement.re.test(value as string)} />
    ));

    const strength = getStrength(value as string);
    const color = strength === 100 ? 'teal' : strength > 50 ? 'yellow' : 'red';

    return (
        <Popover opened={popoverOpened} position="bottom" width="target" transitionProps={{ transition: 'pop' }}>
            <Popover.Target>
                <div
                    onFocusCapture={() => setPopoverOpened(true)}
                    onBlurCapture={() => setPopoverOpened(false)}
                >
                    <PasswordInput
                        withAsterisk
                        label="Password"
                        placeholder="Your secret passphrase"
                        {...props}
                    />
                </div>
            </Popover.Target>
            <Popover.Dropdown>
                <Progress color={color} value={strength} size={5} mb="xs" />
                <PasswordRequirement label="Includes at least 8 characters" meets={(value as string).length > 7} />
                {checks}
            </Popover.Dropdown>
        </Popover>
    );
}