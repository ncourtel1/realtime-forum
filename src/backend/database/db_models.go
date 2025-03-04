package db

type User struct {
	Username  string `json:"Username"`
	Age       int    `json:"Age"`
	Gender    string `json:"Gender"`
	FirstName string `json:"FirstName"`
	LastName  string `json:"LastName"`
	Email     string `json:"Email"`
	Password  string `json:"Password"`
}

type Communication struct {
	Message string `json:"Message"`
	Error   bool   `json:"Error"`
}

type Message struct {
	ID             int    `json:"id"`
	ConversationID int    `json:"conversation_id"`
	SenderID       int    `json:"sender_id"`
	Content        string `json:"content"`
	SentAt         string `json:"sent_at"`
}
