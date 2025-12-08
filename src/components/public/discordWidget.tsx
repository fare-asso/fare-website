export default async function DiscordWidget() {
    return (
        <div>
            <iframe
                src="https://discord.com/widget?id=1405839659929436191&theme=dark"
                width="350"
                height="500"
                sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
                className="border-0 bg-transparent"
                referrerPolicy="no-referrer"
                title="Widget Discord"
            />
        </div>
    )
}
