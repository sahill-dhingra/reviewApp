function OptionSelector({
    options,
    selected,
    setSelected,
    variant = "checkbox",
}) {
    function handleSelect(option) {
        if (variant === "radio") {
            // "Nothing" is mutually exclusive with every other option
            if (option === "Nothing") {
                setSelected(["Nothing"]);
                return;
            }

            // Selecting another option removes "Nothing"
            const withoutNothing = selected.filter(
                (item) => item !== "Nothing"
            );

            if (withoutNothing.includes(option)) {
                setSelected(
                    withoutNothing.filter((item) => item !== option)
                );
            } else {
                setSelected([...withoutNothing, option]);
            }

            return;
        }

        // Normal checkbox behavior
        if (selected.includes(option)) {
            setSelected(selected.filter((item) => item !== option));
        } else {
            setSelected([...selected, option]);
        }
    }

    return (
        <div className="flex flex-col gap-3">
            {options.map((option) => {
                const isSelected = selected.includes(option);

                return (
                    <button
                        key={option}
                        type="button"
                        onClick={() => handleSelect(option)}
                        className={`flex w-full items-center justify-between rounded-2xl border px-4 py-4 text-left transition ${
                            isSelected
                                ? "border-[#004aad] bg-[#efeffd]"
                                : "border-[#E5E1DC] bg-white"
                        }`}
                    >
                        <span className="text-[15px] text-[#292725]">
                            {option}
                        </span>

                        <span
                            className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                                isSelected
                                    ? "border-[#004aad] bg-[#004aad]"
                                    : "border-[#CFCAC4]"
                            }`}
                        >
                            {isSelected && (
                                <span className="h-2 w-2 rounded-full bg-white" />
                            )}
                        </span>
                    </button>
                );
            })}
        </div>
    );
}

export default OptionSelector;