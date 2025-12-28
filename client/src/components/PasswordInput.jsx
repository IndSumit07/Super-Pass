import React, { useState, useEffect } from "react";
import { Lock, Eye, EyeOff, Check, X } from "lucide-react";

const PasswordInput = ({
    value,
    onChange,
    name = "password",
    placeholder = "Enter password",
    showStrength = false,
    onValidationChange
}) => {
    const [show, setShow] = useState(false);

    // Criteria
    const hasMinLen = value.length >= 8;
    const hasUpper = /[A-Z]/.test(value);
    const hasLower = /[a-z]/.test(value);
    const hasNumber = /[0-9]/.test(value);
    const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value);

    const isValid = hasMinLen && hasUpper && hasLower && hasNumber && hasSpecial;

    // Notify parent of validation status
    useEffect(() => {
        if (onValidationChange) {
            onValidationChange(isValid);
        }
    }, [isValid, onValidationChange, value]); // value dependency to re-trigger if needed, though boolean changes are enough

    const CriteriaItem = ({ met, text }) => (
        <div className={`flex items-center gap-2 text-xs transition-colors duration-200 ${met ? "text-emerald-400" : "text-white/50"}`}>
            {met ? <Check size={14} className="shrink-0" /> : <div className="w-3.5 h-3.5 rounded-full border border-white/20 shrink-0" />}
            <span className={met ? "text-emerald-100" : ""}>{text}</span>
        </div>
    );

    return (
        <div className="w-full">
            {/* Input Field */}
            <div
                className={`relative h-12 px-3 rounded-xl border bg-[#0c1222]/60 flex items-center gap-2 transition duration-200 focus-within:bg-[#0c1222]/80 focus-within:border-white/20 ${value && showStrength
                        ? isValid
                            ? "border-emerald-500/40"
                            : "border-white/10" // Don't show red border while typing unless we want to be strict. Let's keep it neutral or strictly valid/invalid.
                        : "border-white/10"
                    }`}
            >
                <Lock className="h-4 w-4 text-white/60" />
                <input
                    name={name}
                    type={show ? "text" : "password"}
                    value={value}
                    onChange={onChange}
                    className="w-full bg-transparent outline-none text-sm placeholder:text-white/30"
                    placeholder={placeholder}
                    autoComplete="new-password"
                />
                <button
                    type="button"
                    onClick={() => setShow(!show)}
                    className="p-1 text-white/40 hover:text-white transition cursor-pointer"
                >
                    {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
            </div>

            {/* Strength Meter / Checklist */}
            {showStrength && (
                <div className={`mt-3 grid grid-cols-1 gap-y-2 p-3 rounded-xl bg-white/5 border border-white/5 transition-all duration-300 ${value ? "opacity-100" : "opacity-50"}`}>
                    <p className="text-[10px] uppercase tracking-wider text-white/40 mb-1 font-semibold">Password Requirements</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                        <CriteriaItem met={hasMinLen} text="At least 8 characters" />
                        <CriteriaItem met={hasUpper} text="Uppercase letter (A-Z)" />
                        <CriteriaItem met={hasLower} text="Lowercase letter (a-z)" />
                        <CriteriaItem met={hasNumber} text="Number (0-9)" />
                        <CriteriaItem met={hasSpecial} text="Special character (!@#...)" />
                    </div>
                </div>
            )}
        </div>
    );
};

export default PasswordInput;
