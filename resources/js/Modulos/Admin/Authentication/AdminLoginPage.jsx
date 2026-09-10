import React, { useEffect, useId, useState } from 'react';
import { ArrowRight, Eye, EyeOff, KeyRound, LockKeyhole, Mail, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../../api';
import { Button } from '../DesignSystem/primitives/Button';
import { IconButton } from '../DesignSystem/primitives/IconButton';
import './admin-login.css';

const defaultErrorMessage = 'Não foi possível validar o acesso. Revise os dados e tente novamente.';

export default function AdminLoginPage({ onLoginSuccess }) {
  const navigate = useNavigate();
  const emailId = useId();
  const passwordId = useId();
  const mfaId = useId();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [mfaRequired, setMfaRequired] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!onLoginSuccess && sessionStorage.getItem('hub_admin_token')) {
      navigate('/admin', { replace: true });
    }
  }, [navigate, onLoginSuccess]);

  const completeLogin = (token) => {
    if (onLoginSuccess) {
      onLoginSuccess(token);
      return;
    }

    sessionStorage.setItem('hub_admin_token', token);
    navigate('/admin', { replace: true });
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/admin/login', {
        email,
        password,
        ...(mfaRequired ? { mfa_code: mfaCode.trim() } : {}),
      });
      const token = response.data?.token;

      if (!token) {
        setError(defaultErrorMessage);
        return;
      }

      completeLogin(token);
    } catch (requestError) {
      const response = requestError.response;
      const status = response?.data?.status;

      if (status === 'mfa_required') {
        setMfaRequired(true);
        setError('Informe o código do seu aplicativo autenticador para continuar.');
      } else if (status === 'mfa_enrollment_required') {
        setError('A autenticação multifator precisa ser configurada antes de acessar o painel. Procure a administração da loja.');
      } else if (response?.status === 429) {
        setError('Muitas tentativas em pouco tempo. Aguarde alguns minutos antes de tentar novamente.');
      } else if (response?.status === 422) {
        setError('Informe um e-mail válido e a sua senha para continuar.');
      } else {
        setError(defaultErrorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="hub-admin hub-admin-auth" aria-labelledby="admin-login-title">
      <div className="hub-admin-auth-orb hub-admin-auth-orb-primary" aria-hidden="true" />
      <div className="hub-admin-auth-orb hub-admin-auth-orb-secondary" aria-hidden="true" />

      <section className="hub-admin-auth-shell">
        <aside className="hub-admin-auth-intro" aria-label="Apresentação do acesso administrativo">
          <div className="hub-admin-auth-brand">
            <span className="hub-admin-auth-brand-mark" aria-hidden="true">HC</span>
            <span>
              <strong>HUB Commerce</strong>
              <small>OPERAÇÃO DA LOJA</small>
            </span>
          </div>

          <div className="hub-admin-auth-intro-copy">
            <span className="hub-admin-auth-kicker"><ShieldCheck aria-hidden="true" size={16} /> Ambiente protegido</span>
            <h1>Gestão segura para a sua operação.</h1>
            <p>Entre para acompanhar pedidos, catálogo, clientes e integrações em um único painel.</p>
          </div>

          <div className="hub-admin-auth-security-note">
            <ShieldCheck aria-hidden="true" size={20} />
            <span>O acesso é validado por perfil, permissões e sessão temporária.</span>
          </div>
        </aside>

        <div className="hub-admin-auth-card">
          <header className="hub-admin-auth-card-header">
            <span className="hub-admin-auth-mobile-mark" aria-hidden="true">HC</span>
            <p className="hub-page-eyebrow">Acesso administrativo</p>
            <h2 id="admin-login-title">Bem-vindo de volta</h2>
            <p>Use suas credenciais para continuar no painel da loja.</p>
          </header>

          {error ? (
            <div className="hub-admin-auth-feedback" role="alert">
              <ShieldCheck aria-hidden="true" size={18} />
              <span>{error}</span>
            </div>
          ) : null}

          <form className="hub-admin-auth-form" onSubmit={handleLogin} noValidate>
            <label className="hub-admin-auth-field" htmlFor={emailId}>
              <span>E-mail</span>
              <span className="hub-admin-auth-input-wrap">
                <Mail aria-hidden="true" size={18} />
                <input
                  id={emailId}
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="voce@empresa.com.br"
                />
              </span>
            </label>

            <div className="hub-admin-auth-field">
              <label htmlFor={passwordId}>Senha</label>
              <span className="hub-admin-auth-input-wrap">
                <LockKeyhole aria-hidden="true" size={18} />
                <input
                  id={passwordId}
                  type={isPasswordVisible ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Digite sua senha"
                />
                <IconButton
                  icon={isPasswordVisible ? EyeOff : Eye}
                  label={isPasswordVisible ? 'Ocultar senha' : 'Mostrar senha'}
                  className="hub-admin-auth-password-toggle"
                  onClick={() => setIsPasswordVisible((current) => !current)}
                />
              </span>
            </div>

            {mfaRequired ? (
              <label className="hub-admin-auth-field" htmlFor={mfaId}>
                <span>Código de verificação</span>
                <span className="hub-admin-auth-input-wrap">
                  <KeyRound aria-hidden="true" size={18} />
                  <input
                    id={mfaId}
                    type="text"
                    autoComplete="one-time-code"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    required
                    value={mfaCode}
                    onChange={(event) => setMfaCode(event.target.value)}
                    placeholder="Código do autenticador"
                  />
                </span>
              </label>
            ) : null}

            <Button type="submit" loading={loading} icon={ArrowRight} className="hub-admin-auth-submit">
              {mfaRequired ? 'Verificar e acessar' : 'Acessar painel'}
            </Button>
          </form>

          <footer className="hub-admin-auth-card-footer">
            <LockKeyhole aria-hidden="true" size={16} />
            <span>Não compartilhe suas credenciais de acesso.</span>
          </footer>
        </div>
      </section>
    </main>
  );
}
