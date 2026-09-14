function Rating({ rating, setRating }) {
    return (
        <div className="flex justify-between px-2">
            {[1, 2, 3, 4, 5].map((star) => {
                const selected = star <= rating;

                return (
                    <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        aria-label={`Rate ${star} out of 5`}
                        className="flex h-12 w-12 items-center justify-center transition-transform active:scale-90"
                    >
                        <svg
                            viewBox="0 0 24 24"
                            className="h-10 w-10"
                            fill={
                                selected
                                    ? "currentColor"
                                    : "none"
                            }
                            stroke="currentColor"
                            strokeWidth="1.7"
                            strokeLinejoin="round"
                            style={{
                                color: selected
                                    ? "#004aad"
                                    : "#D8D4CE",
                            }}
                        >
                            <path d="m12 3 2.78 5.63 6.22.9-4.5 4.39 1.06 6.2L12 17.2l-5.56 2.92 1.06-6.2L3 9.53l6.22-.9L12 3Z" />
                        </svg>
                    </button>
                );
            })}
        </div>
    );
}

export default Rating;