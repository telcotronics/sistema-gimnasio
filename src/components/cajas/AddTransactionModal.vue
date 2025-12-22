<template>
  <v-dialog :value="show" @input="close" max-width="500px" persistent>
    <v-card>
      <v-form ref="form" v-model="valid" lazy-validation>
        <v-card-title>
          <span class="text-h5">Añadir Transacción al Registro</span>
        </v-card-title>

        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model="transaction.details"
                  label="Detalles de la transacción"
                  :rules="[rules.required]"
                  required
                  outlined
                  dense
                  autofocus
                ></v-text-field>
              </v-col>

              <v-col cols="12" sm="6">
                <v-text-field
                  v-model.number="transaction.value"
                  label="Valor"
                  type="number"
                  prefix="$"
                  :rules="[rules.required, rules.notZero]"
                  required
                  outlined
                  dense
                ></v-text-field>
              </v-col>

              <v-col cols="12" sm="6">
                <v-btn-toggle
                  v-model="transactionType"
                  mandatory
                  color="primary"
                  group
                  class="d-flex"
                >
                  <v-btn value="income" class="flex-grow-1">
                    <v-icon left>mdi-plus</v-icon>
                    Ingreso
                  </v-btn>
                  <v-btn value="expense" class="flex-grow-1">
                    <v-icon left>mdi-minus</v-icon>
                    Gasto
                  </v-btn>
                </v-btn-toggle>
              </v-col>
            </v-row>
          </v-container>
          <small>*Los gastos se registrarán como valores negativos.</small>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="close">Cancelar</v-btn>
          <v-btn color="primary" depressed @click="save" :disabled="!valid">Guardar</v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: 'AddTransactionModal',
  props: {
    show: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      valid: true,
      transactionType: 'income', // 'income' o 'expense'
      transaction: {
        details: '',
        value: null
      },
      rules: {
        required: value => !!value || 'Este campo es requerido.',
        notZero: value => (value !== 0 && value !== null) || 'El valor no puede ser cero.'
      }
    };
  },
  methods: {
    close() {
      this.$emit('close');
      this.$refs.form.reset();
      this.$refs.form.resetValidation();
      this.transactionType = 'income';
    },
    save() {
      if (this.$refs.form.validate()) {
        const finalValue = this.transactionType === 'expense'
          ? -Math.abs(this.transaction.value)
          : Math.abs(this.transaction.value);

        this.$emit('save', { ...this.transaction, value: finalValue });
        this.close();
      }
    }
  }
};
</script>