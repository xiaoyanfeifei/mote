import { Role } from 'mote/platform/store/common/record';

export class Permission {
	static canRead(role: Role) {
		return role === Role.Reader || role === Role.CommmetOnly || role === Role.ReadAndWrite || role === Role.Editor;
	}

	static canComment(role: Role) {
		return role === Role.CommmetOnly || role === Role.ReadAndWrite || role === Role.Editor;
	}

	static canEdit(role: Role) {
		return role === Role.ReadAndWrite || role === Role.Editor;
	}
}
