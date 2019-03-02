class CreateTopics < ActiveRecord::Migration[5.2]
  def change
    create_table :topics do |t|
      t.string :title
      t.text :content
      t.integer :user_id
      t.integer :group_id
      t.integer :theme_id
      t.json :last_post
      t.integer :posts_count

      t.timestamps
    end
  end
end
