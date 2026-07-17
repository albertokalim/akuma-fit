import React, { useState } from 'react';
import { supabase } from '../../supabaseClient';
import Button from '../../components/primitives/Button/Button.jsx';
import Label from '../../components/primitives/Label/Label.jsx';
import TextInput from '../../components/primitives/TextInput/TextInput.jsx';
import Link from '../../components/primitives/Link/Link.jsx';
import './Register.css';

function Register({ onNavigateToLogin }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [isRegistered, setIsRegistered] = useState(false);
    const [errors, setErrors] = useState({
        email: false,
        password: false,
        message: ''
    });

    const handleRegister = async (e) => {
        e.preventDefault();
        //los setters son asíncronos Vicenta
        let emailError = !email;
        let passwordError = !password;

        if (emailError || passwordError) {
            setErrors({
                email: emailError,
                password: passwordError,
                message: 'Por favor, rellena los campos obligatorios.'
            });
        } else {
            // Si pasa la validación, limpiamos errores previos y continuamos
            setErrors({ email: false, password: false, message: '' });
            setLoading(true);

            const { data, error } = await supabase.auth.signUp({
                email: email,
                password: password,
            });

            setLoading(false);

            if (error) {
                // Si Supabase devuelve un error (ej. email ya registrado o contraseña muy corta)
                setErrors({
                    email: error.message.includes('email') || error.message.includes('user'),
                    password: error.message.includes('password'),
                    message: error.message
                });
            } else {
                // Registro exitoso
                setIsRegistered(true);
            }
        }
    };

    if (isRegistered) {
        return (
            <div className="auth-container">
                <div className="success-content">
                    <h2>¡Cuenta creada! 🎉</h2>
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