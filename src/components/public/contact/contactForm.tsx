
export default function ContactForm() {
    return (
        <div className="flex flex-col md:flex-row w-full md:w-[70%] bg-black mt-12 p-8 rounded-3xl">
            {/* Text Section */}
            <div className="flex flex-col justify-center w-full md:w-1/2 pr-0 md:pr-8 mb-6 md:mb-0">
                <h2 className="text-2xl text-white font-semibold mb-4">Vous avez une question ?</h2>
                <p className="text-gray-300">
                    N'hésitez pas à nous contacter. Notre équipe se fera un plaisir de vous répondre dans les plus brefs délais.
                </p>
            </div>

            {/* Form Section */}
            <form className="flex flex-col w-full md:w-1/2 space-y-4 text-white">
                {/* First name + Last name */}
                <div className="flex flex-col sm:flex-row gap-4 w-full">
                    <input 
                        type="text" 
                        placeholder="Prénom" 
                        className="flex-1 text-center bg-[#202124] py-3 px-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/20 w-full"
                    />
                    <input 
                        type="text" 
                        placeholder="Nom" 
                        className="flex-1 text-center bg-[#202124] py-3 px-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/20 w-full"
                    />
                </div>

                {/* Email address */}
                <input 
                    type="email" 
                    placeholder="Email" 
                    className="w-full text-center bg-[#202124] py-3 px-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/20"
                />

                {/* Message */}
                <textarea 
                    placeholder="Entrez votre message ici" 
                    className="w-full text-center bg-[#202124] py-3 px-4 rounded-xl h-32 resize-none focus:outline-none focus:ring-2 focus:ring-white/20"
                ></textarea>

                {/* Submit button */}
                <button 
                    type="submit" 
                    className="w-full rounded-full bg-white/20 py-3 text-lg text-gray-200 hover:bg-white/30 transition-colors duration-200"
                >
                    Envoyer
                </button>
            </form>
        </div>
    )
}