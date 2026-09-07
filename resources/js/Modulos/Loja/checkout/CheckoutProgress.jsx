import { Check } from 'lucide-react';
import { motion } from 'framer-motion';

const steps = [
    { number: 1, label: 'Sua conta' },
    { number: 2, label: 'Entrega' },
    { number: 3, label: 'Pagamento' },
];

export default function CheckoutProgress({ currentStep, reducedMotion }) {
    const completed = Math.max(0, currentStep - 1);
    const progress = ((completed / (steps.length - 1)) * 100).toString();

    return (
        <div className="relative grid grid-cols-3 gap-2 py-2">
            <div className="absolute left-8 right-8 top-6 h-px bg-slate-200" aria-hidden="true">
                <motion.div
                    className="h-full origin-left bg-blue-600"
                    animate={{ scaleX: Number(progress) / 100 }}
                    transition={reducedMotion ? { duration: 0 } : { duration: 0.24, ease: 'easeOut' }}
                />
            </div>

            {steps.map((step) => {
                const isComplete = step.number < currentStep;
                const isCurrent = step.number === currentStep;

                return (
                    <div key={step.number} className="relative z-10 flex flex-col items-center gap-2 text-center">
                        <span
                            className={[
                                'flex h-10 w-10 items-center justify-center rounded-full border text-sm font-bold',
                                isComplete || isCurrent
                                    ? 'border-blue-600 bg-blue-600 text-white'
                                    : 'border-slate-200 bg-white text-slate-500',
                            ].join(' ')}
                            aria-current={isCurrent ? 'step' : undefined}
                        >
                            {isComplete ? <Check className="h-5 w-5" aria-hidden="true" /> : step.number}
                        </span>
                        <span className={isCurrent || isComplete ? 'text-xs font-semibold text-slate-900' : 'text-xs font-medium text-slate-500'}>
                            {step.label}
                        </span>
                    </div>
                );
            })}
        </div>
    );
}
