// Example: Team Registration Section Component
// This can be integrated into RegisterEvent.jsx

import React from "react";
import { Users, Mail, Trash2, Plus, AlertCircle } from "lucide-react";

export function TeamRegistrationSection({
  isTeamReg,
  setIsTeamReg,
  teamSize,
  setTeamSize,
  teamName,
  setTeamName,
  teamEmails,
  setTeamEmails,
  event,
  onTeamSizeChange,
  onEmailChange,
  onAddEmail,
  onRemoveEmail,
}) {
  const canAddMore = teamEmails.length < teamSize - 1;
  const requiredEmails = teamSize - 1;
  const filledEmails = teamEmails.filter((e) => e.trim() !== "").length;

  return (
    <div className="space-y-4">
      {/* Team Toggle */}
      {event?.isTeamEvent && (
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-[#19cfbc]/10 border border-[#19cfbc]/20 grid place-items-center">
                <Users className="h-5 w-5 text-[#19cfbc]" />
              </div>
              <div>
                <h4 className="text-sm font-semibold">Team Registration</h4>
                <p className="text-xs text-white/60">
                  Register as a team ({event.teamMin}-{event.teamMax} members)
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsTeamReg(!isTeamReg)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                isTeamReg ? "bg-[#19cfbc]" : "bg-white/20"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isTeamReg ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>
      )}

      {/* Team Details (shown when team mode is enabled) */}
      {isTeamReg && (
        <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-4">
          {/* Team Size */}
          <div>
            <label className="block text-xs text-white/70 mb-2">
              Team Size *
            </label>
            <input
              type="number"
              min={event?.teamMin || 2}
              max={event?.teamMax || 10}
              value={teamSize}
              onChange={(e) => onTeamSizeChange(Number(e.target.value))}
              className="w-full h-11 px-3 rounded-lg border border-white/10 bg-[#0c1222]/60 outline-none text-sm"
            />
            <p className="text-xs text-white/50 mt-1">
              Min: {event?.teamMin || 2}, Max: {event?.teamMax || 10}
            </p>
          </div>

          {/* Team Name (Optional) */}
          <div>
            <label className="block text-xs text-white/70 mb-2">
              Team Name (Optional)
            </label>
            <input
              type="text"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="Enter your team name"
              className="w-full h-11 px-3 rounded-lg border border-white/10 bg-[#0c1222]/60 outline-none text-sm placeholder:text-white/40"
            />
          </div>

          {/* Team Member Emails */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs text-white/70">
                Team Member Emails * ({filledEmails}/{requiredEmails})
              </label>
              {canAddMore && (
                <button
                  onClick={onAddEmail}
                  className="inline-flex items-center gap-1 text-xs text-[#19cfbc] hover:text-[#19cfbc]/80 transition"
                >
                  <Plus className="h-3 w-3" />
                  Add
                </button>
              )}
            </div>

            <div className="space-y-2">
              {teamEmails.map((email, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="flex-1 relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => onEmailChange(index, e.target.value)}
                      placeholder={`Member ${index + 1} email`}
                      className="w-full h-11 pl-10 pr-3 rounded-lg border border-white/10 bg-[#0c1222]/60 outline-none text-sm placeholder:text-white/40"
                    />
                  </div>
                  {teamEmails.length > 1 && (
                    <button
                      onClick={() => onRemoveEmail(index)}
                      className="h-11 w-11 rounded-lg border border-white/10 bg-white/5 hover:bg-red-500/10 hover:border-red-500/20 transition grid place-items-center"
                    >
                      <Trash2 className="h-4 w-4 text-white/60 hover:text-red-400" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {filledEmails < requiredEmails && (
              <div className="mt-2 flex items-start gap-2 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                <AlertCircle className="h-4 w-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-yellow-200/90">
                  Please provide {requiredEmails - filledEmails} more email
                  address{requiredEmails - filledEmails > 1 ? "es" : ""} to
                  complete your team.
                </p>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <p className="text-xs text-blue-200/90">
              <strong>Note:</strong> Invitations will be sent to all team
              members. They must verify their email with an OTP to confirm
              participation. Team registration will be confirmed once all
              members verify.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// Example usage in RegisterEvent.jsx:
/*
import { TeamRegistrationSection } from './TeamRegistrationSection';

// In your component:
const [isTeamReg, setIsTeamReg] = useState(false);
const [teamSize, setTeamSize] = useState(2);
const [teamName, setTeamName] = useState("");
const [teamEmails, setTeamEmails] = useState([""]);

const handleTeamSizeChange = (newSize) => {
  setTeamSize(newSize);
  const requiredEmails = newSize - 1;
  if (teamEmails.length < requiredEmails) {
    setTeamEmails([...teamEmails, ...Array(requiredEmails - teamEmails.length).fill("")]);
  } else if (teamEmails.length > requiredEmails) {
    setTeamEmails(teamEmails.slice(0, requiredEmails));
  }
};

const handleEmailChange = (index, value) => {
  const newEmails = [...teamEmails];
  newEmails[index] = value;
  setTeamEmails(newEmails);
};

const handleAddEmail = () => {
  if (teamEmails.length < teamSize - 1) {
    setTeamEmails([...teamEmails, ""]);
  }
};

const handleRemoveEmail = (index) => {
  setTeamEmails(teamEmails.filter((_, i) => i !== index));
};

// In your JSX, replace the Checkout section with:
<TeamRegistrationSection
  isTeamReg={isTeamReg}
  setIsTeamReg={setIsTeamReg}
  teamSize={teamSize}
  setTeamSize={setTeamSize}
  teamName={teamName}
  setTeamName={setTeamName}
  teamEmails={teamEmails}
  setTeamEmails={setTeamEmails}
  event={ev}
  onTeamSizeChange={handleTeamSizeChange}
  onEmailChange={handleEmailChange}
  onAddEmail={handleAddEmail}
  onRemoveEmail={handleRemoveEmail}
/>
*/
