import React, { useState } from 'react';
import { supabase } from '../../supabaseClient';
import Button from '../../components/primitives/Button/Button.jsx';
import Label from '../../components/primitives/Label/Label.jsx';
import TextInput from '../../components/primitives/TextInput/TextInput.jsx';
import Link from '../../components/primitives/Link/Link.jsx';
import { translateSupabaseAuthError } from '../../utils/supabaseErrors.js';
import './Register.css';

// Formato de email estándar: usuario@dominio.tld
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Contraseña segura: al menos una minúscula, una mayúscula, un número,
// un carácter especial y un mínimo de 8 caracteres.
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

function Register({ onNavigateToLogin }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [isRegistered, setIsRegistered] = useState(false);
    const [errors, setErrors] = useState({
        email: false,
        password: false,
        confirmPassword: false,
        message: ''
    });

    // Valida los campos localmente (vacíos, formato y coincidencia de contraseñas)
    // antes de llamar a Supabase. Devuelve null si todo es correcto, o el objeto
    // de errores a mostrar si algo falla.
    const validateFields = () => {
        // 1. Campos obligatorios
        if (!email || !password || !confirmPassword) {
            return {
                email: !email,
                password: !password,
                confirmPassword: !confirmPassword,
                message: 'Por favor, rellena todos los campos obligatorios.'
            };
        }

        // 2. Formato de email
        if (!EMAIL_REGEX.test(email)) {
            return {
                email: true,
                password: false,
                confirmPassword: false,
                message: 'El correo electrónico introducido no tiene un formato válido.'
            };
        }

        // 3. Formato de contraseña (mayúscula, minúscula, número, carácter especial, min. 8 caracteres)
        if (!PASSWORD_REGEX.test(password)) {
            return {
                email: false,
                password: true,
                confirmPassword: false,
                message: 'La contraseña debe tener al menos 8 caracteres e incluir una mayúscula, una minúscula, un número y un carácter especial.'
            };
        }

        // 4. Las dos contraseñas deben coincidir
        if (password !== confirmPassword) {
            return {
                email: false,
                password: true,
                confirmPassword: true,
                message: 'Las contraseñas no coinciden.'
            };
        }

        return null;
    };

    const handleRegister = async (e) => {
        e.preventDefault();

        const validationErrors = validateFields();

        if (validationErrors) {
            setErrors(validationErrors);
            return;
        }

        // Si pasa la validación, limpiamos errores previos y continuamos
        setErrors({ email: false, password: false, confirmPassword: false, message: '' });
        setLoading(true);

        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password,
        });

        setLoading(false);

        if (error) {
            // Si Supabase devuelve un error (ej. email ya registrado o contraseña muy corta),
            // lo traducimos para no mostrar el texto interno en inglés.
            setErrors({
                email: error.message.includes('email') || error.message.includes('user'),
                password: error.message.toLowerCase().includes('password'),
                confirmPassword: false,
                message: translateSupabaseAuthError(error.message)
            });
        } else {
            // Registro exitoso
            setIsRegistered(true);
        }
    };

    if (isRegistered) {
        return (
            <div className="auth-container">
                <div className="success-content">
                    <h2>¡Cuenta creada!</h2>
                    <p className="success-text">
                        Confirme su correo electrónico para poder iniciar sesión. Hemos enviado un enlace de verificación a su bandeja de entrada.
                    </p>
                    <div className="login-link">
                        <p><Link text="Ir a iniciar sesión" onClick={onNavigateToLogin} className="link" /></p>
                    </div>
                </div>
            </div>
        );
    } else {
        return (
            <div className="auth-container">
                <h2>{loading ? 'Creando cuenta...' : 'Crear Cuenta'}</h2>

                <form onSubmit={handleRegister} className="auth-form">
                    {errors.message && <div className="error-message">{errors.message}</div>}

                    {/* Campo de Email */}
                    <div className="input-group">
                        <Label text="Correo Electrónico" htmlFor="register-email" />
                        <TextInput
                            id="register-email"
                            type="email"
                            placeholder="ejemplo@correo.com"
                            onChange={(e) => setEmail(e.target.value)}
                            hasError={errors.email}
                            className="text-input"
                        />
                    </div>

                    {/* Campo de Contraseña */}
                    <div className="input-group">
                        <Label text="Contraseña" htmlFor="register-password" />
                        <TextInput
                            id="register-password"
                            type="password"
                            placeholder="Crea una contraseña segura"
                            onChange={(e) => setPassword(e.target.value)}
                            hasError={errors.password}
                            className="text-input"
                        />
                    </div>

                    {/* Campo de Repetir Contraseña */}
                    <div className="input-group">
                        <Label text="Repetir Contraseña" htmlFor="register-confirm-password" />
                        <TextInput
                            id="register-confirm-password"
                            type="password"
                            placeholder="Repite tu contraseña"
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            hasError={errors.confirmPassword}
                            className="text-input"
                        />
                    </div>

                    <Button text="Registrarse" onClick={handleRegister} />
                </form>
                <div className="login-link">
                    <p>¿Ya tienes cuenta? <Link text="Inicia sesión aquí" onClick={onNavigateToLogin} className="link" /></p>
                </div>
            </div>
        );
    }
}


export default Register;