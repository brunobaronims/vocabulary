import type React from 'react';
import { toast } from 'sonner';

function Home() {

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        try {
            return;
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to login.';
            toast.error(message);
        }
    }

    return (
        <div className="w-full h-full flex items-center justify-center">
            <div className="flex-col w-full h-full sm:w-120 sm:h-fit py-10 flex items-center justify-center shadow-lg rounded-md sm:border border-stone-400/50">
                <div className="h-full w-full px-10 flex flex-col justify-center items-center">
                    <h1 className="font-bold text-xl sm:text-2xl mb-10">
                        Vocabulary Learning Tracker
                    </h1>
                    <form
                        className="w-full flex flex-col gap-3"
                        onSubmit={handleSubmit}
                    >
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Home;
