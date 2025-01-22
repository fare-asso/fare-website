export default async function DiscordWidget() {
    return (
        <div>
            <iframe
                src="https://discord.com/widget?id=1051811140457472061&theme=dark&hide_avatars=true"
                width="350"
                height="500"
                sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
                className="border-0 bg-transparent"
                referrerPolicy="strict-origin-when-cross-origin"
                title="Widget Discord"
            />
        </div>
    );
}
