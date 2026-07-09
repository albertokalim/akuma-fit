import React, { useState } from 'react';
import Button from './Button';
import Label from './Label';
import TextInput from './TextInput';
import {supabase} from "../supabaseClient.js";

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();

        setLoading(true);
        const { data, error } = await supabase.auth.signInWithPassword({
           email: email,
           password: password
        });
        setLoading(false);

        if(error){
            alert('Error al iniciar sesión: ' + error.message);
        } else {
            alert('Sesión iniciada con éxito');
        }
    };

    const handleGoogleLogin = async () => {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin
            }
        });

        if(error){
            alert('Error al iniciar sesión con Google: ' + error.message);
        }
    };

    return (
        <div style={styles.container}>
            <h2>Iniciar Sesión</h2>
            <form onSubmit={handleLogin} style={styles.form}>
                <div style={styles.inputGroup}>
                    <Label text="Correo Electrónico" htmlFor="email-input" />
                    <TextInput
                        type="email"
                        placeholder="ejemplo@correo.com"
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
                <div style={styles.inputGroup}>
                    <Label text="Contraseña" htmlFor="password-input" />
                    <TextInput
                        type="password"
                        placeholder="Tu contraseña"
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>

                <Button text="Entrar" onClick={handleLogin} />
            </form>

            <div style={styles.googleContainer}>
                <Button
                    text="Iniciar sesión con Google"
                    onClick={handleGoogleLogin}
                />
            </div>
        </div>
    );
}

//Los estilos hay que hacerlos guay
// Unos estilos rápidos para que no se vea desordenado
const styles = {
    container: {
        maxWidth: '400px',
        margin: '50px auto',
        padding: '20px',
        border: '1px solid #ccc',
        borderRadius: '8px',
        fontFamily: 'Arial, sans-serif'
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '15px'
    },
    inputGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '5px'
    },
    divider: {
        textAlign: 'center',
        margin: '20px 0',
        borderBottom: '1px solid #eee',
        lineHeight: '0.1em'
    },
    googleContainer: {
        display: 'flex',
        justifyContent: 'center',
        marginTop: '10px'
    }
};

export default Login;