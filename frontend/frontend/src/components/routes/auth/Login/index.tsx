import {Button, PasswordInput, TextInput} from "@mantine/core";
import {NavLink} from "react-router";
import {useMutation} from "@tanstack/react-query";
import {notifications} from '@mantine/notifications';
import {authClient} from "../../../../api/auth.client.ts";
import {LoginData, LoginResponse} from "../../../../types.ts";
import {useForm} from "@mantine/form";
import {redirectToPreviousUrl} from "../../../../api/client.ts";
import classes from "./Login.module.scss";
import {t, Trans} from "@lingui/macro";

const Login = () => {
    const form = useForm({
        initialValues: {
            fullName: '',
            password: '',
        }
    });
console.log(import.meta.env)
    const { mutate: loginUser, isPending } = useMutation({
        mutationFn: (userData: { fullName: string; password: string }) => authClient.login(userData.fullName, userData.password),

        onSuccess: (response: LoginResponse) => {
            if (response.access_token) {
                redirectToPreviousUrl();
            }
        },

        onError: () => {
            notifications.show({
                message: t`Please check your email and password and try again`,
                color: 'red',
                position: 'top-center',
            });
        }
    });

    return (
        <>
            <header className={classes.header}>
                <h2>{t`Welcome back 👋`}</h2>
                <p>
                    <Trans>
                        Don't have an account? {'  '}
                        <NavLink to={'/auth/register'}>
                            Sign up
                        </NavLink>
                    </Trans>
                </p>
            </header>
            <div className={classes.loginCard}>
                <form onSubmit={form.onSubmit((values) => loginUser(values))}>
                    <TextInput
                        {...form.getInputProps('fullName')}
                        label={t`Full Name`}
                        placeholder="John Doe"
                        required
                    />
                    <PasswordInput
                        {...form.getInputProps('password')}
                        label={t`Password`}
                        placeholder={t`Your password`}
                        required
                        mt="md"
                    />
                    <p>
                        <NavLink to={`/auth/forgot-password`}>
                            {t`Forgot password?`}
                        </NavLink>
                    </p>
                    <Button color={'var(--tk-pink)'} type="submit" fullWidth loading={isPending} disabled={isPending}>
                        {isPending ? t`Logging in` : t`Log in`}
                    </Button>
                </form>
            </div>
        </>
    );
};

export default Login;
