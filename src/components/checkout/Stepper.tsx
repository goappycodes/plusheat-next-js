/** #checkout_menu_bar: About You -> Payment -> Confirmation. */
export function Stepper({ step }: { step: 1 | 2 | 3 }) {
  const steps = ["About You", "Payment", "Confirmation"];
  return (
    <div className="container-ph pt-5">
      <div className="mb-5 border-y border-border-light bg-white py-5">
        <div className="mx-auto flex max-w-[500px] items-start justify-center gap-[34px] px-[15px] min-[481px]:gap-[70px]">
          {steps.map((label, i) => {
            const n = i + 1;
            const active = n <= step;
            return (
              <div
                key={label}
                className={`relative pt-[50px] text-center text-[13px] leading-[1.5] min-[481px]:text-[14px] ${active ? "text-primary" : "text-text"}`}
              >
                <span
                  className={`absolute left-1/2 top-0 flex h-10 w-10 -translate-x-1/2 items-center justify-center rounded-full ${
                    active ? "bg-primary text-white" : "bg-border-light text-[#9aa0a6]"
                  }`}
                >
                  {n}
                </span>
                {n < steps.length && (
                  <span
                    aria-hidden="true"
                    className="absolute left-[calc(50%+28px)] top-5 h-[2px] w-[30px] bg-border-light min-[481px]:left-[calc(50%+37px)] min-[481px]:w-[85px]"
                  />
                )}
                <span className="whitespace-nowrap">{label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
