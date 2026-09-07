import { ArrowRight, UserRoundCheck } from 'lucide-react';

export default function CheckoutAccountStep({
    customer,
    onChange,
    onSubmit,
    isSubmitting,
}) {
    return (
        <form onSubmit={onSubmit} className="space-y-6">
            <div className="space-y-2">
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700">
                    <UserRoundCheck className="h-4 w-4" aria-hidden="true" />
                    Conta de compra
                </span>
                <h1 className="text-2xl font-bold tracking-tight text-slate-950">Vamos criar seu acesso</h1>
                <p className="text-sm leading-6 text-slate-600">
                    Você compra como visitante, mas sua conta será criada nesta loja para acompanhar pedidos e salvar endereços.
                </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <label className="block sm:col-span-2">
                    <span className="mb-2 block text-sm font-semibold text-slate-800">Nome completo</span>
                    <input
                        required
                        autoComplete="name"
                        value={customer.name}
                        onChange={(event) => onChange('name', event.target.value)}
                        className="min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-slate-950 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                    />
                </label>

                <label className="block sm:col-span-2">
                    <span className="mb-2 block text-sm font-semibold text-slate-800">E-mail</span>
                    <input
                        required
                        type="email"
                        autoComplete="email"
                        value={customer.email}
                        onChange={(event) => onChange('email', event.target.value)}
                        className="min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-slate-950 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                    />
                </label>

                <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-slate-800">Senha</span>
                    <input
                        required
                        minLength="8"
                        type="password"
                        autoComplete="new-password"
                        value={customer.password}
                        onChange={(event) => onChange('password', event.target.value)}
                        className="min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-slate-950 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                    />
                    <span className="mt-2 block text-xs leading-5 text-slate-500">Use ao menos 8 caracteres.</span>
                </label>

                <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-slate-800">Confirmar senha</span>
                    <input
                        required
                        minLength="8"
                        type="password"
                        autoComplete="new-password"
                        value={customer.password_confirmation}
                        onChange={(event) => onChange('password_confirmation', event.target.value)}
                        className="min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-slate-950 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                    />
                </label>
            </div>

            <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 font-bold text-white transition hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
                {isSubmitting ? 'Validando sua conta…' : 'Continuar para entrega'}
                {!isSubmitting && <ArrowRight className="h-5 w-5" aria-hidden="true" />}
            </button>
        </form>
    );
}
