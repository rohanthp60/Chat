import styles from "./Chat.module.css";

const ItemSelector = ({ items, setSelectedItems, ItemComponent, checkDisabled = false }) => (
    <ul className={styles.selector}>
        {items.map(item => (
            <li className={styles.selectorItem} key={item.id}>
                <label>
                    <input
                        type="checkbox"
                        value={item.id}
                        onChange={event => {
                            if (event.target.checked) {
                                setSelectedItems(previous => [...previous, item.id]);
                            } else {
                                setSelectedItems(previous =>
                                    previous.filter(id => id !== item.id)
                                );
                            }
                        }}
                        disabled={checkDisabled}
                    />
                    <ItemComponent item={item} />
                </label>
            </li>
        ))}
    </ul>
);

export default ItemSelector;
