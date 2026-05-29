import { useState } from "react";
import { Mail, Lock, Eye, EyeOff, AlertCircle } from "lucide-react";
import { authService } from "../../services";

interface LoginPageProps {
  onLogin?: () => void;
}
import logoLudus from "../../assets/images/logo-full.png";
import logoLudusDice from "../../assets/images/logo-dice.png";

export function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (
  e: React.FormEvent
) => {
  e.preventDefault();

  setError("");
  setLoading(true);

  const cleanedEmail = email
    .trim()
    .toLowerCase();

  const cleanedPassword =
    password.trim();

  // CAMPOS
  if (
    !cleanedEmail ||
    !cleanedPassword
  ) {
    setError(
      "Preencha e-mail e senha."
    );

    setLoading(false);
    return;
  }

  // EMAIL
  const emailRegex =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (
    !emailRegex.test(cleanedEmail)
  ) {
    setError(
      "Digite um e-mail válido."
    );

    setLoading(false);
    return;
  }

  try {
    const response =
      await authService.login({
        email: cleanedEmail,
        senha: cleanedPassword,
      });

    // TOKEN
    if (response?.token) {
      localStorage.setItem(
        "token",
        response.token
      );
    }

    // USER
    if (response?.user) {
      localStorage.setItem(
        "user",
        JSON.stringify(response.user)
      );
    }

    setLoading(false);

    if (onLogin) {
      onLogin();
    }
  } catch (err: any) {
    console.error(err);

    const apiMessage =
      err?.response?.data?.message ||
      err?.response?.data?.error;

    setError(
      apiMessage ||
        "E-mail ou senha incorretos."
    );

    setLoading(false);
  }
};

  return (
    <div className="flex min-h-screen overflow-hidden bg-white">
      {/* ESQUERDA */}
      <div className="relative hidden w-[42%] overflow-hidden bg-[#37379B] lg:flex items-center justify-center">
        {/* BG CIRCULOS */}
        <div className="absolute -right-36 -top-36 h-[340px] w-[340px] rounded-full bg-[#FBBC04]/35" />

        <div className="absolute -right-20 -top-20 h-[240px] w-[240px] rounded-full bg-[#FBBC04]/45" />

        <div className="absolute -bottom-44 -left-44 h-[420px] w-[420px] rounded-full bg-[#FC090D]/35" />

        <div className="absolute -bottom-24 -left-24 h-[300px] w-[300px] rounded-full bg-[#FC090D]/50" />

        {/* TRACEJADO TOPO */}
        <div className="absolute -right-28 top-10 h-[240px] w-[240px] rounded-full border-[3px] border-dashed border-white/15" />

        {/* TRACEJADO BAIXO */}
        <div className="absolute -left-24 bottom-10 h-[240px] w-[240px] rounded-full border-[3px] border-dashed border-white/15" />
        {/* CONTEUDO */}
        <div className="relative z-10 flex flex-col items-center px-10">
          {/* LOGO */}
          <img
            src={logoLudus}
            alt="Ludus"
            className="w-[380px] max-w-full drop-shadow-2xl"
          />
        </div>
      </div>

      {/* DIREITA */}
<div className="relative flex w-full items-end justify-center overflow-hidden bg-[#f3f6ff] px-4 pt-10 lg:w-[58%] lg:items-center lg:px-10">
  
  {/* BG */}
  <div className="absolute inset-0">
    
    {/* glow azul */}
    <div className="absolute right-[-100px] top-[-100px] h-[260px] w-[260px] rounded-full bg-[#31358B]/10 blur-3xl" />

    {/* glow amarelo */}
    <div className="absolute bottom-[10%] right-[10%] h-[180px] w-[180px] rounded-full bg-[#FBBC04]/10 blur-3xl" />

    {/* glow vermelho */}
    <div className="absolute left-[-80px] top-[30%] h-[220px] w-[220px] rounded-full bg-[#FC090D]/10 blur-3xl" />
  </div>

  <div className="relative z-10 w-full max-w-lg">
    
    {/* MOBILE LOGO */}
    <div className="mb-8 flex justify-center lg:hidden">
      <img
        src={logoLudusDice}
        alt="Ludus"
        className="w-[230px]"
      />
    </div>

    {/* CARD */}
    <div className="rounded-t-[38px] border border-white/60 bg-white px-7 pb-8 pt-8 shadow-[0_-10px_50px_rgba(49,53,139,0.08)] lg:rounded-[38px]">
      
      {/* TOPO */}
      <div className="mb-8">
        
   
        <h1 className="text-[36px] font-black leading-tight text-[#31358B]">
          Bem-vindo de volta!
        </h1>

        <p className="mt-3 text-[15px] leading-relaxed text-[#666]">
          Entre com sua conta para acessar o sistema administrativo da Ludus.
        </p>
      </div>

      {/* FORM */}
      <form onSubmit={handleSubmit} className="space-y-5">
        
        {/* EMAIL */}
        <div>
          <label className="mb-2 block text-sm font-semibold text-[#535353]">
            E-mail
          </label>

          <div className="flex items-center rounded-2xl border border-[#dfe3f2] bg-[#fafbff] px-4 transition-all focus-within:border-[#FBBC04] focus-within:bg-white focus-within:ring-4 focus-within:ring-[#FBBC04]/20">
            <Mail
              size={19}
              className="mr-3 text-[#7b8199]"
            />

            <input
              type="email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              placeholder="Seu e-mail"
              className="h-14 w-full bg-transparent text-[#333] outline-none placeholder:text-[#9ca3af]"
            />
          </div>
        </div>

        {/* SENHA */}
        <div>
          <label className="mb-2 block text-sm font-semibold text-[#535353]">
            Senha
          </label>

          <div className="flex items-center rounded-2xl border border-[#dfe3f2] bg-[#fafbff] px-4 transition-all focus-within:border-[#FBBC04] focus-within:bg-white focus-within:ring-4 focus-within:ring-[#FBBC04]/20">
            
            <Lock
              size={19}
              className="mr-3 text-[#7b8199]"
            />

            <input
              type={
                showPassword
                  ? 'text'
                  : 'password'
              }
              value={password}
              onChange={(e) =>
                setPassword(
                  e.target.value
                )
              }
              placeholder="Sua senha"
              className="h-14 w-full bg-transparent text-[#333] outline-none placeholder:text-[#9ca3af]"
            />

            <button
              type="button"
              onClick={() =>
                setShowPassword(
                  !showPassword
                )
              }
              className="text-[#7b8199] transition hover:text-[#31358B]"
            >
              {showPassword ? (
                <EyeOff size={20} />
              ) : (
                <Eye size={20} />
              )}
            </button>
          </div>
        </div>

        {/* ESQUECI */}
        <div className="flex justify-end">
          <button
            type="button"
            className="text-sm font-semibold text-[#31358B] transition hover:opacity-70"
          >
            Esqueceu sua senha?
          </button>
        </div>

        {/* BTN */}
        <button
          type="submit"
          disabled={loading}
          className="mt-2 flex h-14 w-full items-center justify-center rounded-2xl bg-[#31358B] text-[15px] font-bold text-white shadow-lg shadow-[#31358B]/20 transition-all hover:scale-[1.01] hover:bg-[#272b73] disabled:opacity-60"
        >
          {loading ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            'Entrar'
          )}
        </button>

        {/* ERROR */}
        {error && (
          <div className="flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-600">
            <AlertCircle size={18} />

            <span className="text-sm font-medium">
              {error}
            </span>
          </div>
        )}
      </form>

      {/* DIVIDER */}
      <div className="my-7 flex items-center gap-4">
        <div className="h-px flex-1 bg-[#e5e7eb]" />

        <span className="text-sm text-[#9ca3af]">
          ou
        </span>

        <div className="h-px flex-1 bg-[#e5e7eb]" />
      </div>

      {/* GOOGLE */}
      <button
        className="flex h-14 w-full items-center justify-center rounded-2xl border border-[#dfe3f2] bg-white font-semibold text-[#31358B] transition-all hover:bg-[#f8faff]"
      >
        Continuar com Google
      </button>

      {/* FOOTER */}
      <div className="mt-8 text-center">
        <p className="text-sm text-[#666]">
          Não possui uma conta?{' '}
          <button className="font-bold text-[#31358B] underline-offset-4 hover:underline">
            Solicitar acesso
          </button>
        </p>
      </div>
    </div>
  </div>
</div>
    </div>
  );
}
