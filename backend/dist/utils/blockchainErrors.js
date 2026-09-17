export function blockchainMessage(error) { const message = error instanceof Error ? error.message.toLowerCase() : ""; if (message.includes("insufficient funds"))
    return "ETH ใน Wallet ไม่เพียงพอสำหรับค่าธรรมเนียมเครือข่าย"; if (message.includes("execution reverted") || message.includes("call exception"))
    return "ธุรกรรมถูกปฏิเสธโดย Smart Contract"; if (message.includes("network") || message.includes("socket") || message.includes("timeout"))
    return "ไม่สามารถเชื่อมต่อเครือข่าย Ethereum Sepolia ได้"; return "ไม่สามารถดำเนินการธุรกรรมบน Blockchain ได้"; }
