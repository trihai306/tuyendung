<?php

namespace App\Filament\Resources\CompanyResource\RelationManagers;

use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Support\Facades\Hash;

class MembersRelationManager extends RelationManager
{
    protected static string $relationship = 'members';

    protected static ?string $title = 'Thành viên';

    protected static ?string $modelLabel = 'thành viên';

    public function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\TextInput::make('name')
                    ->label('Họ tên')
                    ->required()
                    ->maxLength(255),
                Forms\Components\TextInput::make('email')
                    ->label('Email')
                    ->email()
                    ->required()
                    ->unique(ignoreRecord: true)
                    ->maxLength(255),
                Forms\Components\TextInput::make('password')
                    ->label('Mật khẩu')
                    ->password()
                    ->dehydrateStateUsing(fn($state) => filled($state) ? Hash::make($state) : null)
                    ->dehydrated(fn($state) => filled($state))
                    ->required(fn(string $operation): bool => $operation === 'create')
                    ->maxLength(255),
                Forms\Components\Select::make('company_role')
                    ->label('Vai trò')
                    ->options([
                        'owner' => 'Chủ sở hữu',
                        'admin' => 'Quản trị viên',
                        'member' => 'Thành viên',
                    ])
                    ->default('member')
                    ->required(),
            ]);
    }

    public function table(Table $table): Table
    {
        return $table
            ->recordTitleAttribute('name')
            ->columns([
                Tables\Columns\TextColumn::make('name')
                    ->label('Họ tên')
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('email')
                    ->label('Email')
                    ->searchable(),
                Tables\Columns\BadgeColumn::make('company_role')
                    ->label('Vai trò')
                    ->formatStateUsing(fn(?string $state): string => match ($state) {
                        'owner' => 'Chủ sở hữu',
                        'admin' => 'Quản trị',
                        'member' => 'Thành viên',
                        default => '-',
                    })
                    ->colors([
                        'primary' => 'owner',
                        'success' => 'admin',
                        'gray' => 'member',
                    ]),
                Tables\Columns\IconColumn::make('email_verified_at')
                    ->label('Xác thực')
                    ->boolean(),
                Tables\Columns\TextColumn::make('created_at')
                    ->label('Ngày tham gia')
                    ->dateTime('d/m/Y'),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('company_role')
                    ->label('Vai trò')
                    ->options([
                        'owner' => 'Chủ sở hữu',
                        'admin' => 'Quản trị viên',
                        'member' => 'Thành viên',
                    ]),
            ])
            ->headerActions([
                Tables\Actions\CreateAction::make()
                    ->label('Thêm thành viên'),
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
                Tables\Actions\Action::make('changeRole')
                    ->label('Đổi vai trò')
                    ->icon('heroicon-o-user-group')
                    ->form([
                        Forms\Components\Select::make('company_role')
                            ->label('Vai trò mới')
                            ->options([
                                'owner' => 'Chủ sở hữu',
                                'admin' => 'Quản trị viên',
                                'member' => 'Thành viên',
                            ])
                            ->required(),
                    ])
                    ->action(fn($record, array $data) => $record->update(['company_role' => $data['company_role']])),
                Tables\Actions\DeleteAction::make()
                    ->label('Xóa khỏi công ty'),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ]);
    }
}
