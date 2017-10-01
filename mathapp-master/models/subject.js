
var subjectSchema = new Schema({
                    subject: { type: String, required: true},
                    description: String,  //, unique: true 
                    created_at: Date,
                    updated_at: Date
                  });