import {
    Body,
    Container,
    Head,
    Hr,
    Html,
    Img,
    Link,
    pixelBasedPreset,
    Tailwind,
    Text
} from "react-email"
import type { JSX } from "react"
import React from "react"

export const APP_URL = "https://fare-asso.fr"
export const APPLICATION_NAME = "FARE"

interface BaseTemplateProps {
    children?: (JSX.Element | undefined)[] | JSX.Element
}

export function BaseTemplate({ children }: BaseTemplateProps) {
    return (
        <Html>
            <Head />
            <Body style={main}>
                <Tailwind
                    config={{
                        presets: [pixelBasedPreset]
                    }}
                >
                    <Container style={container}>
                        <Link href={APP_URL} className="text-stone-900">
                            <Img
                                src={`${APP_URL}/logo_fare.png`}
                                width="42"
                                height="42"
                                alt={APPLICATION_NAME}
                                style={logo}
                                className="inline-block align-middle"
                            />
                            <Text className="ms-4 inline-block align-middle text-xl">
                                {APPLICATION_NAME}
                            </Text>
                        </Link>
                        {children}
                        <Hr style={hr} />
                        <Link href={APP_URL} style={reportLink}>
                            {APPLICATION_NAME}
                        </Link>
                    </Container>
                </Tailwind>
            </Body>
        </Html>
    )
}

BaseTemplate.PreviewProps = {
    APP_URL: "http://localhost",
    APPLICATION_NAME: "Karr Email Preview"
} as BaseTemplateProps

export default BaseTemplate

const logo = {
    borderRadius: 10,
    width: 42,
    height: 42
}

const main = {
    backgroundColor: "#ffffff",
    fontFamily:
        '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif'
}

const container = {
    margin: "0 auto",
    padding: "20px 10px 48px",
    maxWidth: "560px"
}

const reportLink = {
    fontSize: "14px",
    color: "#b4becc",
    textDecoration: "underline"
}

const hr = {
    borderColor: "#dfe1e4",
    margin: "42px 0 26px"
}
