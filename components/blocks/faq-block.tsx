"use client";

import { useState } from "react";
import type { FaqProps } from "@/lib/builder/blocks/faq";
import type { BuilderBlockComponentProps } from "@/lib/builder/types";

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-slate-200">
      <button
        className="flex w-full items-center justify-between gap-4 py-5 text-left"
        onClick={() => setOpen(!open)}
        type="button"
      >
        <span className="text-base font-medium text-slate-950">{question}</span>
        <span
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition-transform ${
            open ? "rotate-45" : ""
          }`}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24">
            <path
              d="M12 5v14M5 12h14"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.8"
            />
          </svg>
        </span>
      </button>
      {open && (
        <p className="pb-5 text-sm leading-7 text-slate-600">{answer}</p>
      )}
    </div>
  );
}

export function FaqBlock({
  props,
  isEditor = false,
}: BuilderBlockComponentProps<FaqProps>) {
  return (
    <section
      className={`px-6 py-18 md:px-10 md:py-22 ${
        isEditor ? "bg-slate-50" : "bg-white"
      }`}
    >
      <div className="mx-auto max-w-4xl">
        <div className="mb-10 max-w-2xl">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-indigo-600">
            FAQ
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl">
            {props.title}
          </h2>
          <p className="mt-4 text-base leading-8 text-slate-600">{props.description}</p>
        </div>
        <div>
          {props.items.map((item, index) =>
            isEditor ? (
              <div className="border-b border-slate-200 py-5" key={`${item.question}-${index}`}>
                <p className="text-base font-medium text-slate-950">{item.question}</p>
                <p className="mt-2 text-sm leading-7 text-slate-600">{item.answer}</p>
              </div>
            ) : (
              <FaqItem answer={item.answer} key={`${item.question}-${index}`} question={item.question} />
            )
          )}
        </div>
      </div>
    </section>
  );
}
