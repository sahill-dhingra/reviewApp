import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import Rating from "../components/Rating";
import OptionSelector from "../components/OptionSelector";

function ReviewPage() {
    const { businessId } = useParams();

    const [business, setBusiness] = useState(null);
    const [categoryOptions, setCategoryOptions] = useState(null);
    const [rating, setRating] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [liked, setLiked] = useState([]);
    const [issues, setIssues] = useState([]);
    const [generatedReview, setGeneratedReview] = useState("");
    const [step, setStep] = useState(1);
    const [isGenerating, setIsGenerating] = useState(false);

    const [isEditing, setIsEditing] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        async function getBusiness() {
            const {
                data: businessData,
                error: businessError,
            } = await supabase
                .from("businesses")
                .select("*")
                .eq("id", businessId)
                .single();

            if (businessError) {
                console.error(businessError);
                setError("Business not found");
                setLoading(false);
                return;
            }

            setBusiness(businessData);

            const {
                data: optionsData,
                error: optionsError,
            } = await supabase
                .from("category_options")
                .select("*")
                .eq("category", businessData.category);


            if (optionsError || !optionsData || optionsData.length === 0) {
                setError("Category options not found");
                setLoading(false);
                return;
            }

            setCategoryOptions(optionsData[0]);
            setLoading(false);
        }

        getBusiness();
    }, [businessId]);

    async function generateReview() {
        setIsGenerating(true);
        setError(null);

        try {
            const { data, error } = await supabase.functions.invoke(
                "generate-review",
                {
                    body: {
                        businessName: business.name,
                        category: business.category,
                        rating,
                        liked,
                        issues,
                    },
                }
            );

            if (error) {
                console.error("Edge Function error:", error);
                console.error("Edge Function error context:", error.context);

                throw error;
            }

            if (!data?.review) {
                throw new Error("No review was generated.");
            }

            setGeneratedReview(data.review);
            setStep(4);
        } catch (error) {
            console.error("Review generation error:", error);
            console.error("Full error:", JSON.stringify(error, null, 2));

            setError(
                error?.message ||
                "Unable to generate your review. Please try again."
            );
        } finally {
            setIsGenerating(false);
        }
    }

    // async function copyReview() {
    //     try {
    //         await navigator.clipboard.writeText(generatedReview);

    //         setCopied(true);

    //         setTimeout(() => {
    //             setCopied(false);
    //         }, 1800);
    //     } catch (error) {
    //         console.error("Failed to copy review:", error);
    //         alert("Copy failed: " + error.message);
    //     }
    // }

    async function copyReview() {
        try {
            // Modern Clipboard API
            if (
                navigator.clipboard &&
                typeof navigator.clipboard.writeText === "function"
            ) {
                await navigator.clipboard.writeText(generatedReview);
            } else {
                // Fallback for HTTP / older mobile browsers
                const textarea = document.createElement("textarea");

                textarea.value = generatedReview;
                textarea.style.position = "fixed";
                textarea.style.left = "-9999px";
                textarea.style.top = "0";
                textarea.style.opacity = "0";

                document.body.appendChild(textarea);

                textarea.focus();
                textarea.select();

                const successful =
                    document.execCommand("copy");

                textarea.remove();

                if (!successful) {
                    throw new Error("Fallback copy failed");
                }
            }

            setCopied(true);

            setTimeout(() => {
                setCopied(false);
            }, 1800);
        } catch (error) {
            console.error("Failed to copy review:", error);
            alert("Unable to copy the review.");
        }
    }

    async function submitReview() {
        try {
            // 1. Copy the CURRENT review text
            if (
                navigator.clipboard &&
                typeof navigator.clipboard.writeText === "function"
            ) {
                await navigator.clipboard.writeText(generatedReview);
            } else {
                // Fallback for your Wi-Fi / HTTP testing
                const textarea = document.createElement("textarea");

                textarea.value = generatedReview;
                textarea.style.position = "fixed";
                textarea.style.left = "-9999px";
                textarea.style.top = "0";
                textarea.style.opacity = "0";

                document.body.appendChild(textarea);

                textarea.focus();
                textarea.select();

                const successful =
                    document.execCommand("copy");

                textarea.remove();

                if (!successful) {
                    throw new Error("Could not copy review");
                }
            }

            // 2. Save the CURRENT review to Supabase
            const { error } = await supabase
                .from("review_sessions")
                .insert({
                    business_id: business.id,
                    rating,
                    liked,
                    issues,
                    generated_review: generatedReview,
                });

            if (error) {
                console.error(
                    "Failed to save review:",
                    error
                );
                return;
            }

            // 3. Open Google
            window.open(
                business.google_review_url,
                "_blank"
            );

        } catch (error) {
            console.error(
                "Failed to continue to Google:",
                error
            );

            alert(
                "We couldn't copy your review. Please use the Copy button and try again."
            );
        }
    }

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#F9F8F6]">
                <p className="text-sm text-[#756E69]">Loading...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#F9F8F6] p-6">
                <p className="text-center text-[#756E69]">
                    {error}
                </p>
            </div>
        );
    }

    return (
        // <main className="h-dvh  bg-[#F9F8F6] px-2 sm:px-4 ">
        <main className="relative h-dvh overflow-y-auto px-2 sm:px-4">

            {/* Background */}
            <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30"
                style={{ backgroundImage: "url('/bg.png')" }}
            />

            {/* Everything you already have */}
            <div className="relative z-10 flex h-full flex-col">

                <div className="mx-auto flex h-full w-full max-w-100 flex-col px-5 py-5">

                    {/* Progress */}
                    <div className="flex gap-1.5">
                        {[1, 2, 3, 4].map((item) => (
                            <div
                                key={item}
                                className={`h-1.5 flex-1 rounded-full ${item <= step
                                    ? "bg-[#004aad]"
                                    : "bg-[#E7E4DF]"
                                    }`}
                            />
                        ))}
                    </div>

                    {/* Step + Business */}
                    <div className="mt-5 text-center">
                        <p className="text-[14px] leading-5 text-[#756E69]">
                            Step {step} of 4
                        </p>

                        <p className="mt-2 text-[14px] uppercase tracking-[0.02em] text-[#756E69]">
                            {business.name}
                        </p>
                    </div>

                    {/* Main Content */}
                    <div
                        className={`flex flex-1 flex-col ${step === 1
                            ? "pt-14.5"
                            : step === 4
                                ? "pt-8.5"
                                : "pt-7.25"
                            }`}
                    >

                        {/* STEP 1 */}
                        {step === 1 && (
                            <>
                                <h1 className="text-center text-[27px] font-bold leading-[1.12] tracking-[-0.03em] text-[#11100F]">
                                    How was your visit?
                                </h1>

                                <div className="mt-11">
                                    <Rating
                                        rating={rating}
                                        setRating={setRating}
                                    />
                                </div>
                            </>
                        )}

                        {/* STEP 2 */}
                        {step === 2 && (
                            <>
                                <h1 className="text-[26px] font-bold leading-[1.15] tracking-[-0.03em] text-[#11100F]">
                                    What did you like?
                                </h1>

                                <p className="mt-2 text-[16px] text-[#756E69]">
                                    Select all that apply
                                </p>

                                <div className="mt-6">
                                    <OptionSelector
                                        options={categoryOptions?.positive_options || []}
                                        selected={liked}
                                        setSelected={setLiked}
                                    />
                                </div>
                            </>
                        )}

                        {/* STEP 3 */}
                        {step === 3 && (
                            <>
                                <h1 className="text-[25px] font-bold leading-[1.16] tracking-[-0.035em] text-[#11100F]">
                                    {rating >= 4
                                        ? "Anything we could improve?"
                                        : "What could we improve?"}
                                </h1>

                                <p className="mt-2 text-[16px] text-[#756E69]">
                                    Select all that apply
                                </p>

                                <div className="mt-6">
                                    <OptionSelector
                                        options={[
                                            ...(categoryOptions?.improvement_options || []),
                                            "Nothing",
                                        ]}
                                        selected={issues}
                                        setSelected={setIssues}
                                        variant="radio"
                                    />

                                    <p className="mt-2 px-1 text-[14px] text-[#756E69]">
                                        Selecting Nothing will clear other choices
                                    </p>
                                </div>
                            </>
                        )}

                        {/* STEP 4 */}
                        {step === 4 && (
                            <>
                                <h1 className="text-[27px] font-bold leading-[1.12] tracking-[-0.03em] text-[#11100F]">
                                    Your review
                                </h1>

                                <p className="mt-2 text-[15px] leading-6 text-[#756E69]">
                                    Generated from your answers — feel free to edit it
                                </p>

                                {/* Review Card */}
                                <div className="mt-6 rounded-[14px] border border-[#DEDCD8] bg-white p-5">

                                    {isEditing ? (
                                        <textarea
                                            autoFocus
                                            value={generatedReview}
                                            onChange={(e) =>
                                                setGeneratedReview(e.target.value)
                                            }
                                            className="min-h-37.5 w-full resize-none bg-transparent text-[15px] leading-6 text-[#272321] outline-none"
                                        />
                                    ) : (
                                        <p className="min-h-37.5 whitespace-pre-wrap text-[15px] leading-6 text-[#272321]" id="generatedReview">
                                            {generatedReview}
                                        </p>
                                    )}

                                    {/* Copy + Edit */}
                                    <div className="mt-5 flex justify-end gap-2">

                                        {/* Copy */}
                                        <button
                                            type="button"
                                            onClick={copyReview}
                                            aria-label="Copy review"
                                            className="flex h-10 w-10 items-center justify-center rounded-full border border-[#E1DFDB] bg-white text-[#272321] transition active:scale-95"
                                        >
                                            {copied ? (
                                                <svg
                                                    viewBox="0 0 24 24"
                                                    className="h-4.5 w-4.5"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="1.8"
                                                >
                                                    <path
                                                        d="m5 12 4 4L19 6"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    />
                                                </svg>
                                            ) : (
                                                <svg
                                                    viewBox="0 0 24 24"
                                                    className="h-4.5 w-4.5"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="1.7"
                                                >
                                                    <rect
                                                        x="8"
                                                        y="8"
                                                        width="11"
                                                        height="11"
                                                        rx="2"
                                                    />

                                                    <path
                                                        d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"
                                                        strokeLinecap="round"
                                                    />
                                                </svg>
                                            )}
                                        </button>

                                        {/* Edit */}
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setIsEditing((value) => !value)
                                            }
                                            aria-label={
                                                isEditing
                                                    ? "Done editing"
                                                    : "Edit review"
                                            }
                                            className={`flex h-10 w-10 items-center justify-center rounded-full border border-[#E1DFDB] bg-white transition active:scale-95 ${isEditing
                                                ? "text-[#004aad]"
                                                : "text-[#272321]"
                                                }`}
                                        >
                                            {isEditing ? (
                                                <svg
                                                    viewBox="0 0 24 24"
                                                    className="h-4.5 w-4.5"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="1.8"
                                                >
                                                    <path
                                                        d="m5 12 4 4L19 6"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    />
                                                </svg>
                                            ) : (
                                                <svg
                                                    viewBox="0 0 24 24"
                                                    className="h-4.5 w-4.5"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="1.6"
                                                >
                                                    <path
                                                        d="m14.5 6.5 3 3M5 19l4.2-.9L19 8.3a2.1 2.1 0 0 0-3-3L6.2 14.9 5 19Z"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    />
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                </div>

                                <p className="mt-3 text-[14px] leading-5 text-[#756E69]">
                                    You can edit this review before posting.
                                </p>
                            </>
                        )}
                    </div>

                    {/* Bottom Actions */}
                    <div className="pb-1 pt-7">

                        {step === 4 ? (
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsEditing(false);
                                        setStep(3);
                                    }}
                                    className="w-26.25 rounded-xl border border-[#E0DEDA] bg-white py-4 text-[15px] font-semibold text-[#171514] transition active:scale-[0.99]"
                                >
                                    Back
                                </button>

                                <button
                                    type="button"
                                    onClick={submitReview}
                                    className="flex-1 rounded-xl bg-[#004aad] py-4 text-[15px] font-bold text-white transition active:scale-[0.99]"
                                >
                                    Continue to Google
                                </button>
                            </div>
                        ) : (
                            <div className="flex gap-3">
                                {step > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => setStep(step - 1)}
                                        className="w-26.25 rounded-xl border border-[#E0DEDA] bg-white py-4 text-[15px] font-semibold text-[#171514] transition active:scale-[0.99]"
                                    >
                                        Back
                                    </button>
                                )}

                                <button
                                    type="button"
                                    disabled={(step === 1 && rating === 0) || isGenerating}
                                    onClick={() => {
                                        if (step === 3) {
                                            generateReview();
                                        } else {
                                            setStep(step + 1);
                                        }
                                    }}
                                    className="flex-1 rounded-xl bg-[#004aad] py-4 text-[15px] font-bold text-white transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    {step === 3 && isGenerating ? "Creating your review..." : "Next"}
                                </button>
                            </div>
                        )}
                    </div>

                </div>
            </div>

        </main>
    );
}

export default ReviewPage;