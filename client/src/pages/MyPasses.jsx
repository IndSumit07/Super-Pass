// src/pages/MyPasses.jsx
import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { usePasses } from "../contexts/PassContext";
import Loader from "../components/Loader";
import { Ticket as TicketIcon, QrCode } from "lucide-react";

export default function MyPasses() {
  const { passes, fetchMyPasses, loading } = usePasses();

  useEffect(() => {
    fetchMyPasses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="relative min-h-[100svh] w-full bg-[#05070d] text-white overflow-hidden font-space">
        <div className="fixed inset-0 bg-gradient-to-b from-[#0b0f1a] via-[#080b14] to-[#05070d]" />
        <Loader />
      </div>
    );
  }

  return (
    <div className="relative min-h-[100svh] w-full bg-[#05070d] text-white overflow-hidden font-space">
      <div className="fixed inset-0 bg-gradient-to-b from-[#0b0f1a] via-[#080b14] to-[#05070d]" />
      <div className="relative z-10 mx-auto w-[92%] max-w-[980px] py-8">
        <h1 className="text-xl md:text-2xl font-semibold">
          <span className="font-forum text-[#19cfbc]">My</span>{" "}
          <span className="text-white/85">Passes</span>
        </h1>

        <div className="mt-5 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {passes.map((p) => {
            const tpl = p.eventSnapshot?.ticketTemplate;
            const title = p.eventSnapshot?.title;
            const org = p.eventSnapshot?.organization;
            const date = p.eventSnapshot?.start;
            const city = p.eventSnapshot?.city;
            const category = p.eventSnapshot?.category;
            const logo = p.eventSnapshot?.logoUrl;

            return (
              <Link
                to={`/my-passes/${p._id}`}
                key={p._id}
                className="group rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition overflow-hidden"
              >
                <div className="p-4">
                  <div className="text-sm font-semibold text-white/90 inline-flex items-center gap-2">
                    <TicketIcon className="h-4 w-4" /> {title}
                  </div>
                  <div className="mt-1 text-xs text-white/70">{org}</div>
                  <div className="mt-2 text-[11px] text-white/70">
                    {new Date(date).toLocaleString()} • {city}
                  </div>
                  <div className="mt-3 text-[11px] inline-flex items-center gap-2 text-white/70">
                    <QrCode className="h-3.5 w-3.5" /> Tap to view QR & details
                  </div>
                </div>
              </Link>
            );
          })}

          {!passes.length && (
            <div className="col-span-full rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-white/70">
              You don’t have any passes yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
